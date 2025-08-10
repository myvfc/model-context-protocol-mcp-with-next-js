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

    // New Cheer Pal tool with working media
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
                  id: "vid_toe_touch_slowmo",
                  type: "video",
                  title: "Toe Touch Drill (Slow-Mo)",
                  url: "https://filesamples.com/samples/video/mp4/sample_640x360.mp4",
                  thumbnail: "https://via.placeholder.com/320x180.png?text=Toe+Touch+Drill",
                  duration_sec: 15
                },
                {
                  id: "pdf_toe_touch_checklist",
                  type: "pdf",
                  title: "Toe Touch Checklist",
                  url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
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

