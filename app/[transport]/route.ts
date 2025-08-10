import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  async (server) => {
    // Existing tool
    server.tool(
      "echo",
      "description",
      {
        message: z.string(),
      },
      async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }],
      })
    );

    // New Cheer Pal tool
    server.tool(
      "get_media",
      "Returns sample cheer practice media links.",
      {
        role: z.string(),
        age_band: z.string(),
        topic: z.string(),
      },
      async ({ role, age_band, topic }) => {
        return {
          content: [{
            type: "json",
            json: {
              items: [
                {
                  id: "vid_sample_01",
                  type: "video",
                  title: "Sample Toe Touch Drill",
                  url: "https://example.com/videos/toe_touch.mp4",
                  thumbnail: "https://example.com/images/toe_touch_thumb.jpg",
                  duration_sec: 15
                },
                {
                  id: "pdf_sample_01",
                  type: "pdf",
                  title: "Toe Touch Checklist",
                  url: "https://example.com/docs/toe_touch_checklist.pdf"
                }
              ]
            }
          }]
        };
      }
    );
  },
  {
    capabilities: {
      tools: {
        echo: {
          description: "Echo a message",
        },
        get_media: {
          description: "Returns sample cheer practice media links.",
        },
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
  }
);

export { handler as GET, handler as POST, handler as DELETE };
