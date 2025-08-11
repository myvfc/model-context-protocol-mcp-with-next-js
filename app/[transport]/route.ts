// app/[transport]/route.ts
// Self-contained MCP-style route for Cheer Pal on Vercel (no external imports)

import { NextRequest } from "next/server";

type Tool = {
  name: string;
  description: string;
  inputSchema: any;
  execute: (input: any) => Promise<any>;
};

// ---- Tools ----
const tools: Tool[] = [
  {
    name: "check_subscription",
    description: "Checks if a user has an active subscription (stub for now).",
    inputSchema: {
      type: "object",
      properties: { 
        user_id: { 
          type: "string", 
          description: "email or app user id" 
        } 
      },
      required: ["user_id"]
    },
    execute: async (input) => {
      const renewsOn = new Date();
      renewsOn.setMonth(renewsOn.getMonth() + 1);
      return {
        content: [{
          type: "json",
          json: {
            active: true,
            plan: "Pro-Monthly",
            renews_on: renewsOn.toISOString().slice(0, 10)
          }
        }]
      };
    }
  },
  {
    name: "get_practice_plan",
    description: "Returns a practice plan by age band, level, and time.",
    inputSchema: {
      type: "object",
      properties: {
        age_band: { 
          type: "string", 
          enum: ["5-7", "8-11", "12-14", "15-18"],
          description: "Age band for the cheerleader"
        },
        level: { 
          type: "string", 
          enum: ["1", "2", "3", "4"],
          description: "Skill level (1=beginner, 4=advanced)"
        },
        minutes: { 
          type: "number", 
          minimum: 5, 
          maximum: 60,
          description: "Duration of practice in minutes"
        }
      },
      required: ["age_band", "level", "minutes"]
    },
    execute: async (input) => {
      const { age_band, level, minutes } = input;
      
      // Input validation
      if (!["5-7", "8-11", "12-14", "15-18"].includes(age_band)) {
        throw new Error("Invalid age_band. Must be one of: 5-7, 8-11, 12-14, 15-18");
      }
      if (!["1", "2", "3", "4"].includes(level)) {
        throw new Error("Invalid level. Must be one of: 1, 2, 3, 4");
      }
      if (minutes < 5 || minutes > 60) {
        throw new Error("Minutes must be between 5 and 60");
      }

      const warmup = ["Light jog 2 min", "Arm circles x20", "Neck rolls x10"];
      
      const skills = level === "1"
        ? ["Toe touch drills x10", "High V / Low V x10", "Clap & clean x10"]
        : level === "2"
        ? ["Jumps combo x12", "T motions x12", "Core holds 30s x3"]
        : level === "3"
        ? ["Pike jumps x15", "Herkie practice x10", "Tumbling drills x8"]
        : ["Advanced stunts x10", "Full routine run x2", "Performance polish x15"];

      const cooldown = ["Hamstring stretch 30s x2", "Quad stretch 30s x2", "Deep breaths 1 min"];
      
      return {
        content: [{
          type: "json",
          json: {
            title: `Level ${level} — ${minutes} min plan (ages ${age_band})`,
            sections: [
              { name: "Warm-up", items: warmup },
              { name: "Skills", items: skills },
              { name: "Cool-down", items: cooldown }
            ],
            badges: ["Consistency-Star"]
          }
        }]
      };
    }
  },
  {
    name: "get_media",
    description: "Return video/PDF/image links for a topic and age-band.",
    inputSchema: {
      type: "object",
      properties: {
        role: { 
          type: "string", 
          enum: ["cheerleader", "mom", "coach"],
          description: "User role"
        },
        age_band: { 
          type: "string", 
          enum: ["5-7", "8-11", "12-14", "15-18"],
          description: "Age band"
        },
        topic: { 
          type: "string", 
          enum: ["toe-touch", "stretching", "competition-prep"],
          description: "Media topic"
        }
      },
      required: ["role", "age_band", "topic"]
    },
    execute: async (input) => {
      const { role, age_band, topic } = input;
      
      // Input validation
      if (!["cheerleader", "mom", "coach"].includes(role)) {
        throw new Error("Invalid role. Must be one of: cheerleader, mom, coach");
      }
      if (!["5-7", "8-11", "12-14", "15-18"].includes(age_band)) {
        throw new Error("Invalid age_band. Must be one of: 5-7, 8-11, 12-14, 15-18");
      }
      if (!["toe-touch", "stretching", "competition-prep"].includes(topic)) {
        throw new Error("Invalid topic. Must be one of: toe-touch, stretching, competition-prep");
      }

      const base = process.env.PUBLIC_BASE_MEDIA_URL || "https://example.com";
      // Known-good, embeddable YouTube demo video:
      const TEST_VIDEO_ID = "M7lc1UVf-VE";
      const embed_url = `https://www.youtube.com/embed/${TEST_VIDEO_ID}`;
      const watch_url = `https://www.youtube.com/watch?v=${TEST_VIDEO_ID}`;
      
      return {
        content: [{
          type: "json",
          json: {
            items: [
              {
                id: `yt_${TEST_VIDEO_ID}`,
                type: "video",
                title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} (Demo Video)`,
                embed_url,
                watch_url,
                duration_sec: 18
              },
              {
                id: `pdf_checklist_${topic}`,
                type: "pdf",
                title: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Checklist`,
                url: `${base}/docs/${topic}_checklist.pdf`
              },
              {
                id: `img_form_cues_${topic}`,
                type: "image",
                title: "Form Cues",
                url: `${base}/images/${topic}_form_cues.png`
              }
            ]
          }
        }]
      };
    }
  },
  {
    name: "list_media",
    description: "Lists media topics available by role and age band.",
    inputSchema: {
      type: "object",
      properties: { 
        role: { 
          type: "string",
          enum: ["cheerleader", "mom", "coach"],
          description: "User role"
        }, 
        age_band: { 
          type: "string",
          enum: ["5-7", "8-11", "12-14", "15-18"],
          description: "Age band"
        } 
      },
      required: ["role", "age_band"]
    },
    execute: async (input) => {
      const { role, age_band } = input;
      
      // Input validation
      if (!["cheerleader", "mom", "coach"].includes(role)) {
        throw new Error("Invalid role. Must be one of: cheerleader, mom, coach");
      }
      if (!["5-7", "8-11", "12-14", "15-18"].includes(age_band)) {
        throw new Error("Invalid age_band. Must be one of: 5-7, 8-11, 12-14, 15-18");
      }

      // Different topics based on role and age
      const topics = role === "mom" 
        ? ["nutrition", "injury-prevention", "mental-health"]
        : age_band === "5-7"
        ? ["basic-jumps", "simple-motions", "team-building"]
        : ["toe-touch", "stretching", "competition-prep"];

      return {
        content: [{ 
          type: "json", 
          json: { 
            topics,
            role,
            age_band
          } 
        }]
      };
    }
  },
  {
    name: "log_progress",
    description: "Logs a skill completion (stub).",
    inputSchema: {
      type: "object",
      properties: {
        user_id: { 
          type: "string",
          description: "User identifier"
        },
        skill: { 
          type: "string",
          description: "Name of the skill practiced"
        },
        outcome: { 
          type: "string", 
          enum: ["completed", "partial", "skipped"],
          description: "Result of the practice session"
        }
      },
      required: ["user_id", "skill", "outcome"]
    },
    execute: async (input) => {
      const { user_id, skill, outcome } = input;
      
      // Input validation
      if (!user_id || typeof user_id !== 'string') {
        throw new Error("user_id is required and must be a string");
      }
      if (!skill || typeof skill !== 'string') {
        throw new Error("skill is required and must be a string");
      }
      if (!["completed", "partial", "skipped"].includes(outcome)) {
        throw new Error("Invalid outcome. Must be one of: completed, partial, skipped");
      }

      const earned = outcome === "completed";
      const streakDays = earned ? Math.floor(Math.random() * 7) + 1 : 0; // Random streak for demo
      
      return {
        content: [{
          type: "json",
          json: { 
            success: true,
            user_id,
            skill,
            outcome,
            streak_days: streakDays,
            earned_badge: earned ? `${skill.replace(/\s+/g, '-')}-Novice` : null,
            timestamp: new Date().toISOString()
          }
        }]
      };
    }
  }
];

// ---- Route handlers ----

// Discovery: return tool list (some clients call GET to discover tools)
export async function GET() {
  try {
    const response = {
      name: "Cheer Pal MCP Server",
      version: "1.0.0",
      description: "MCP server for cheerleading practice plans and media",
      tools: tools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
      }))
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to retrieve tools list" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// Execution: expects JSON body { tool: string, input: any }
export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    
    try { 
      body = await req.json(); 
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const toolName = body?.tool;
    const input = body?.input ?? {};

    if (!toolName || typeof toolName !== 'string') {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'tool' field in request body" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const foundTool = tools.find(t => t.name === toolName);
    if (!foundTool) {
      return new Response(
        JSON.stringify({ 
          error: `Tool not found: ${toolName}`,
          available_tools: tools.map(t => t.name)
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await foundTool.execute(input);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (executionError: any) {
    console.error('Tool execution error:', executionError);
    
    return new Response(
      JSON.stringify({ 
        error: executionError?.message || "Tool execution failed",
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
