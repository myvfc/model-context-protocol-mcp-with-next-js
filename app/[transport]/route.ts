import { NextRequest } from "next/server";

export async function GET() {
  const tools = [
    {
      name: "check_subscription",
      description: "Checks if a user has an active subscription",
      inputSchema: {
        type: "object",
        properties: { user_id: { type: "string" } },
        required: ["user_id"]
      }
    },
    {
      name: "get_practice_plan", 
      description: "Returns a practice plan by age band, level, and time",
      inputSchema: {
        type: "object",
        properties: {
          age_band: { type: "string", enum: ["5-7","8-11","12-14","15-18"] },
          level: { type: "string", enum: ["1","2","3","4"] },
          minutes: { type: "number", minimum: 5, maximum: 60 }
        },
        required: ["age_band","level","minutes"]
      }
    }
  ];

  return new Response(JSON.stringify({
    name: "Cheer Pal MCP Server",
    tools
  }), {
    headers: { "Content-Type": "application/json" }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tool, input = {} } = body;

    if (!tool) {
      return new Response(JSON.stringify({ error: "Missing tool name" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Handle check_subscription
    if (tool === "check_subscription") {
      const renewsOn = new Date();
      renewsOn.setMonth(renewsOn.getMonth() + 1);
      
      return new Response(JSON.stringify({
        content: [{
          type: "json",
          json: {
            active: true,
            plan: "Pro-Monthly", 
            renews_on: renewsOn.toISOString().slice(0, 10)
          }
        }]
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Handle get_practice_plan
    if (tool === "get_practice_plan") {
      const { age_band, level, minutes } = input;
      
      const warmup = ["Light jog 2 min", "Arm circles x20", "Neck rolls x10"];
      const skills = level === "1" 
        ? ["Toe touch drills x10", "High V / Low V x10", "Clap & clean x10"]
        : ["Jumps combo x12", "T motions x12", "Core holds 30s x3"];
      const cooldown = ["Hamstring stretch 30s x2", "Quad stretch 30s x2"];

      return new Response(JSON.stringify({
        content: [{
          type: "json",
          json: {
            title: `Level ${level} — ${minutes} min plan (ages ${age_band})`,
            sections: [
              { name: "Warm-up", items: warmup },
              { name: "Skills", items: skills },
              { name: "Cool-down", items: cooldown }
            ]
          }
        }]
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Tool not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Request failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
