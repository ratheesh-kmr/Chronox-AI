const OpenAI = require("openai");
const asyncHandler = require("express-async-handler");
const Task = require("../models/taskModel");
const User = require("../models/userModel");
const Project = require("../models/projectModel");
const Team = require("../models/teamModel");
const mongoose = require('mongoose');
const calculateWorkingDuration = require("../utils/calculateWorkingDuration");
const findTeamAndAssignLead = require("../utils/findTeamAndAssignLead");
const setTask = require("./taskController").setTask;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced prompt for better task extraction
const getSystemPrompt = (currentUser) => ({
    role: "system",
    content: `You are Chronox, an AI assistant specialized in task management and productivity.

CORE INSTRUCTIONS:
- Be concise, helpful, and friendly
- Focus on creating/managing tasks and organizing work
- Current user: ${currentUser?.name || 'Unknown'} (${currentUser?.email || ''})

TASK CREATION DETECTION:
When users want to create tasks, they might say things like:
- "Create a task..."
- "Add a task..."
- "I need to assign..."
- "Set up a task..."
- "Create a reminder..."
- "Schedule work for..."
- "Assign [person] to..."

TEAM CREATION DETECTION:
When users want to create teams, they might say things like:
- "Create a team..."
- "Add a team..."
- "Set up a team..."
- "Make a new team..."
- "Form a team..."
- "Create team called..."

USER SEARCH DETECTION:
When users want to find users, they might say things like:
- "Find user..."
- "Search for user..."
- "Show all users"
- "List employees"
- "Who is..."
- "Get user details"
- "Look up user"

TASK EXTRACTION:
If the user wants to create a task, respond with:
1. A helpful confirmation message
2. IMMEDIATELY followed by a JSON object wrapped in <TASK_DATA> tags containing:
{
  "action": "create_task",
  "taskList": "extracted task name",
  "assignedTo": ["name of assignee"],
  "projectName": "project name",
  "taskStartDate": "YYYY-MM-DD format if mentioned",
  "taskEndDate": "YYYY-MM-DD format if mentioned", 
  "priority": "High|Medium|Low - default Medium",
  "description": "any additional details"
}

TEAM EXTRACTION:
If the user wants to create a team, respond with:
1. A helpful confirmation message
2. IMMEDIATELY followed by a JSON object wrapped in <TEAM_DATA> tags containing:
{
  "action": "create_team",
  "teamName": "extracted team name",
  "description": "team description if mentioned"
}

USER SEARCH EXTRACTION:
If the user wants to find users, respond with:
1. A helpful confirmation message
2. IMMEDIATELY followed by a JSON object wrapped in <USER_DATA> tags containing:
{
  "action": "find_user",
  "searchType": "all|name|email|role",
  "searchValue": "search term if specific search",
  "name": "name to search for if mentioned",
  "email": "email to search for if mentioned",
  "role": "role to search for if mentioned"
}

EXAMPLES:
User: "Find user john"
Response: "I'll search for that user!

<USER_DATA>
{
  "action": "find_user",
  "searchType": "name",
  "name": "john"
}
</USER_DATA>"

User: "What do you know about john"
Response: "I'll search the details of john!

<USER_DATA>
{
  "action": "find_user",
  "searchType": "name",
  "name": "john"
}
</USER_DATA>"

User: "Show all users"
Response: "I'll fetch all users for you!

<USER_DATA>
{
  "action": "find_user",
  "searchType": "all"
}
</USER_DATA>"

if the user name is spelled incorrectly or not found, respond with:
 there is no such users but here are some suggestions : 
 show the details of the user name similar to the searched name 
 show just the name not the full detils 

For other queries, respond normally without task, team, or user data.`
});

// Enhanced task detail extraction
const extractTaskDetails = (message) => {
    const taskCreationPatterns = [
        /create\s+(a\s+)?task/i,
        /add\s+(a\s+)?task/i,
        /set\s+up\s+(a\s+)?task/i,
        /assign\s+.+\s+to/i,
        /schedule\s+.+\s+for/i,
        /create\s+.+\s+for/i,
        /give\s+.+\s+task/i,
        /task\s+.+\s+for/i
    ];

    return taskCreationPatterns.some(pattern => pattern.test(message));
};

// Enhanced team detail extraction
const extractTeamDetails = (message) => {
    const teamCreationPatterns = [
        /create\s+(a\s+)?team/i,
        /add\s+(a\s+)?team/i,
        /set\s+up\s+(a\s+)?team/i,
        /make\s+(a\s+)?new\s+team/i,
        /form\s+(a\s+)?team/i,
        /create\s+team\s+called/i,
        /new\s+team/i
    ];

    return teamCreationPatterns.some(pattern => pattern.test(message));
};

// Fixed user detail extraction
const extractUserDetails = (message) => {
    const userPatterns = [
        /find\s+(a\s+)?user/i,
        /search\s+(for\s+)?user/i,
        /look\s+up\s+(a\s+)?user/i,
        /get\s+(details|info|information)\s+(of|about)\s+(a\s+)?user/i,
        /show\s+(me\s+)?(all\s+)?users?/i,
        /list\s+(all\s+)?users?/i,
        /fetch\s+(a\s+)?user/i,
        /who\s+is\s+.+/i,
        /user\s+details?/i,
        /check\s+(a\s+)?user/i,
        /view\s+(all\s+)?users?/i,
        /get\s+(all\s+)?users?/i
    ];

    return userPatterns.some(pattern => pattern.test(message));
};

// Parse JSON from AI response
const parseTaskData = (aiResponse) => {
    try {
        const taskDataMatch = aiResponse.match(/<TASK_DATA>([\s\S]*?)<\/TASK_DATA>/);
        if (taskDataMatch) {
            const jsonString = taskDataMatch[1].trim();
            return JSON.parse(jsonString);
        }
        return null;
    } catch (error) {
        console.error("Failed to parse task data:", error);
        return null;
    }
};

// Parse team data from AI response
const parseTeamData = (aiResponse) => {
    try {
        const teamDataMatch = aiResponse.match(/<TEAM_DATA>([\s\S]*?)<\/TEAM_DATA>/);
        if (teamDataMatch) {
            const jsonString = teamDataMatch[1].trim();
            return JSON.parse(jsonString);
        }
        return null;
    } catch (error) {
        console.error("Failed to parse team data:", error);
        return null;
    }
};

// Fixed user data parsing
const parseUserData = (aiResponse) => {
    try {
        const userDataMatch = aiResponse.match(/<USER_DATA>([\s\S]*?)<\/USER_DATA>/);
        if (userDataMatch) {
            const jsonString = userDataMatch[1].trim();
            return JSON.parse(jsonString);
        }
        return null;
    } catch (error) {
        console.error("Failed to parse user data:", error);
        return null;
    }
};

// Enhanced user finder with better matching
const findAssignedUsers = async (assigneeIdentifiers) => {
    if (!assigneeIdentifiers || !Array.isArray(assigneeIdentifiers)) {
        return { users: [], notFound: [] };
    }

    const users = [];
    const notFound = [];

    for (const identifier of assigneeIdentifiers) {
        try {
            let user = null;

            // Check if it's a valid ObjectId first
            if (mongoose.Types.ObjectId.isValid(identifier)) {
                user = await User.findById(identifier).select('_id name email');
            } else {
                // Search by email, name, or username
                user = await User.findOne({
                    $or: [
                        { email: new RegExp(`^${identifier}$`, "i") },
                        { name: new RegExp(identifier, "i") },
                        { username: new RegExp(`^${identifier}$`, "i") }
                    ],
                }).select('_id name email');
            }

            if (user) {
                users.push(user);
            } else {
                notFound.push(identifier);
            }
        } catch (error) {
            console.error(`Error finding user ${identifier}:`, error);
            notFound.push(identifier);
        }
    }

    return { users, notFound };
};

// Create task using your existing setTask logic
const createTaskViaAPI = async (taskData, req) => {
    try {
        if (!req.user || !req.user._id) {
            throw new Error("User not authenticated. `req.user` is missing.");
        }

        // Mock req/res for reusing setTask
        const mockReq = {
            ...req,
            body: {
                ...taskData,
                assignedBy: req.user._id,
                status: taskData.status || "Upcoming",
                recurrence: taskData.recurrence || { type: "None", repeatCount: 0 },
                subTask: taskData.subTask || []
            }
        };

        let result;
        const mockRes = {
            status: (code) => ({
                json: (data) => {
                    result = { code, ...data };
                    return result;
                }
            })
        };

        await setTask(mockReq, mockRes);

        return { success: true, ...result };
    } catch (error) {
        console.error("Task creation error:", error.message, error.stack);
        return { success: false, error: error.message };
    }
};

// Create team using similar logic
const createTeamViaAPI = async (teamData, req) => {
    try {
        console.log("Incoming teamData from Assistant:", teamData);
        console.log("User from request:", req.user);

        if (!req.user || !req.user._id) {
            throw new Error("User not authenticated. `req.user` is missing.");
        }

        const team = await Team.create({
            teamName: teamData.teamName,
            description: teamData.description || "",
            createdBy: req.user._id,
            members: [],
            teamLeader: req.user._id
        });

        console.log("Team created:", team);

        return { success: true, team };
    } catch (error) {
        console.error("Team creation error:", error.message, error.stack);
        return { success: false, error: error.message };
    }
};

// Fixed user fetching function - use direct database query instead of HTTP request
const fetchUsersViaAPI = async (userData, req) => {
    try {
        if (!req.user || !req.user._id) {
            throw new Error("User not authenticated. `req.user` is missing.");
        }

        let users = [];
        let query = {};

        // Build query based on search type
        switch (userData.searchType) {
            case "all":
                // Fetch all users
                users = await User.find({}).select('_id name email role createdAt');
                break;

            case "name":
                if (userData.name) {
                    query.name = new RegExp(userData.name, "i");
                }
                users = await User.find(query).select('_id name email role createdAt');
                break;

            case "email":
                if (userData.email) {
                    query.email = new RegExp(userData.email, "i");
                }
                users = await User.find(query).select('_id name email role createdAt');
                break;

            case "role":
                if (userData.role) {
                    query.role = userData.role.toUpperCase();
                }
                users = await User.find(query).select('_id name email role createdAt');
                break;

            default:
                // Generic search across multiple fields
                const searchValue = userData.searchValue || userData.name || userData.email;
                if (searchValue) {
                    query = {
                        $or: [
                            { name: new RegExp(searchValue, "i") },
                            { email: new RegExp(searchValue, "i") },
                            { username: new RegExp(searchValue, "i") }
                        ]
                    };
                }
                users = await User.find(query).select('_id name email role createdAt');
        }

        return { success: true, users };
    } catch (error) {
        console.error("Fetch users error:", error.message, error.stack);
        return { success: false, error: error.message };
    }
};

const chatWithAssistant = asyncHandler(async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ reply: "❌ Invalid messages format." });
        }

        const userMessage = messages[messages.length - 1].content;
        const systemMessage = getSystemPrompt(req.user);

        // Get AI response
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [systemMessage, ...messages],
            max_tokens: 400,
            temperature: 0.7,
        });

        let reply = completion.choices[0].message?.content || "⚠️ No response from assistant.";

        // Check if AI detected task creation intent
        const taskData = parseTaskData(reply);
        const teamData = parseTeamData(reply);
        const userData = parseUserData(reply);

        console.log("📌 Parsed taskData:", taskData);
        console.log("📌 Parsed teamData:", teamData);
        console.log("📌 Parsed userData:", userData);


        if (taskData && taskData.action === "create_task") {
            try {
                // Remove task data from user-visible reply
                reply = reply.replace(/<TASK_DATA>[\s\S]*?<\/TASK_DATA>/, '').trim();

                // Find assigned users
                const { users: assignedUsers, notFound } = await findAssignedUsers(taskData.assignedTo);

                if (assignedUsers.length === 0) {
                    return res.json({
                        reply: reply + `\n\n⚠️ Could not find user(s): ${notFound.join(', ')}. Please provide valid user names or emails.`
                    });
                }

                // Find project if specified
                let project = null;
                if (taskData.projectName) {
                    const isValidObjectId = mongoose.Types.ObjectId.isValid(taskData.projectName);

                    if (isValidObjectId) {
                        project = await Project.findById(taskData.projectName);
                    } else {
                        project = await Project.findOne({
                            projectName: new RegExp(taskData.projectName, "i")
                        });
                    }
                }

                const { team, teamLeader } = await findTeamAndAssignLead(assignedUsers);

                const taskCreationData = {
                    projectName: project?._id || null,
                    teams: team || null,
                    assignedBy: req.user._id,
                    createdBy: req.user._id,
                    assignedTo: assignedUsers.map((u) => u._id),
                    taskList: taskData.taskList || "Untitled Task",
                    taskStartDate: taskData.taskStartDate || null,
                    taskEndDate: taskData.taskEndDate || null,
                    priority: taskData.priority || "Medium",
                    description: taskData.description || "",
                    status: "Upcoming",
                    duration: "",
                    teamLeader: teamLeader || req.user._id,
                    recurrence: { type: "None", repeatCount: 0 },
                    subTask: []
                };

                if (!taskCreationData.duration) {
                    if (taskCreationData.taskStartDate && taskCreationData.taskEndDate) {
                        taskCreationData.duration = calculateWorkingDuration(taskCreationData.taskStartDate, taskCreationData.taskEndDate);
                    } else {
                        taskCreationData.duration = "0h";
                    }
                }

                const taskResult = await createTaskViaAPI(taskCreationData, req);
                console.log("API response from task creation:", taskResult);

                if (taskResult.success) {
                    const assigneeNames = assignedUsers.map(u => u.name).join(', ');
                    const projectInfo = project ? ` in project "${project.projectName}"` : '';
                    const teamInfo = team ? ` for team "${team.teamName}"` : '';

                    reply += `\n\n✅ **Task Created Successfully!**
                    📋 **Task:** ${taskData.taskList}
                    👤 **Assigned to:** ${assigneeNames}${projectInfo}${teamInfo}
                    📅 **Dates:** ${taskData.taskStartDate || 'Not set'} → ${taskData.taskEndDate || 'Not set'}
                    ⭐ **Priority:** ${taskData.priority}`;

                    if (notFound.length > 0) {
                        reply += `\n\n⚠️ Note: Could not find these users: ${notFound.join(', ')}`;
                    }

                } else {
                    reply += `\n\n❌ Failed to create task: ${taskResult.error}`;
                }

            } catch (error) {
                console.error("Task Creation Error:", error);
                reply += "\n\n⚠️ An error occurred while creating the task. Please try again or create it manually.";
            }
        }
        // Handle team creation
        else if (teamData && teamData.action === "create_team") {
            try {
                // Remove team data from user-visible reply
                reply = reply.replace(/<TEAM_DATA>[\s\S]*?<\/TEAM_DATA>/, '').trim();

                // Check if team name already exists
                const existingTeam = await Team.findOne({
                    teamName: new RegExp(`^${teamData.teamName}$`, "i")
                });

                if (existingTeam) {
                    return res.json({
                        reply: reply + `\n\n⚠️ A team with the name "${teamData.teamName}" already exists. Please choose a different name.`
                    });
                }

                // Create team
                const teamResult = await createTeamViaAPI(teamData, req);

                if (teamResult.success) {
                    reply += `\n\n✅ **Team Created Successfully!**
                👥 **Team Name:** ${teamData.teamName}
                📝 **Description:** ${teamData.description || 'No description provided'}
                👤 **Team Leader:** ${req.user.name} (You)
                📊 **Members:** 0 (You can add members later)`;
                } else {
                    reply += `\n\n❌ Failed to create team: ${teamResult.error}`;
                }

            } catch (error) {
                console.error("Team Creation Error:", error);
                reply += "\n\n⚠️ An error occurred while creating the team. Please try again or create it manually.";
            }
        }
        // Fixed user search handling
        else if (userData && userData.action === "find_user") {
            try {
                // Remove user data from user-visible reply
                reply = reply.replace(/<USER_DATA>[\s\S]*?<\/USER_DATA>/, '').trim();

                // Use the fixed fetch function
                const userResult = await fetchUsersViaAPI(userData, req);

                if (userResult.success) {
                    const users = userResult.users;

                    if (users.length === 0) {
                        reply += `\n\n⚠️ No users found matching the search criteria.`;
                    } else {
                        reply += `\n\n✅ **Found ${users.length} user(s):**\n\n`;

                        users.forEach((user, index) => {
                            reply += `${index + 1}. 👤 **${user.name}**\n`;
                            reply += `   📧 Email: ${user.email}\n`;
                            reply += `   🏷️ Role: ${user.role}\n`;
                            if (user.createdAt) {
                                reply += `   📅 Joined: ${new Date(user.createdAt).toLocaleDateString()}\n`;
                            }
                            reply += `\n`;
                        });
                    }
                } else {
                    reply += `\n\n❌ Failed to fetch users: ${userResult.error}`;
                }

            } catch (error) {
                console.error("User Search Error:", error);
                reply += "\n\n⚠️ An error occurred while searching for users. Please try again.";
            }
        }

        res.json({ reply });

    } catch (error) {
        console.error("Assistant Error:", error.response?.data || error.message);
        res.status(500).json({ reply: "⚠️ Error connecting to assistant." });
    }
});

module.exports = {
    chatWithAssistant,
};