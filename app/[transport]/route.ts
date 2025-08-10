import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  async (server) => {
    // Health check
    server.tool(
      "echo",
      "description",
      { message: z.string() },
      async ({ message }) => ({
        content: [{ type: "text", text: `Tool echo: ${message}` }],
      })
    );

    // Extremely forgiving media tool: all params optional with defaults
    server.tool(
      "get_media",
      "Returns cheer practice media links (forgiving inputs).",
      {
        role: z.string().optional(),       // cheerleader | mom
        age_band: z.string().optional(),   // e.g., 5-7, 8-11, 12-14, 15-18
        topic: z.string().optional(),      // e.g., toe-touch, warm-up
      },
      async ({ role, age_band, topic }) => {
        const r = (role?.trim().toLowerCase() || "cheerleader");
        const a = (age_band?.trim() || "12-14");
        const t = (topic?.trim().toLowerCase() || "toe-touch");

        // You can branch here later by role/age/topic. For now, always return working links.
        const videoUrl = "https://filesamples.com/samples/video/mp4/sample_640x360.mp4";
        const pdfUrl   = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

        return {
          content: [
            {
              type: "text",
              text:
                `Media for role=${r}, age_band=${a}, topic=${t}\n\n` +
                `Video: ${videoUrl}\n` +
                `PDF:   ${pdfUrl}\n` +
                `\n(If you need a different age or topic, just say it. I accept natural prompts.)`
            }
          ]
        };
      }
    );

    // Zero-input helper for quick sanity checks
    server.tool(
      "media_quick",
      "Returns a toe-touch sample without needing inputs.",
      {},
      async () => ({
        content: [
          {
            type: "text",
            text:
              "Quick media sample:\n" +
              "Video: https://filesamples.com/samples/video/mp4/sample_640x360.mp4\n" +
              "PDF:   https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
          }
        ]
      })
    );
  },
  {
    // Declare tools so clients can discover them
    capabilities: {
      tools: {
        echo:        { description: "Echo a message" },
        get_media:   { description: "Returns cheer practice media links (forgiving inputs)." },
        media_quick: { description: "Returns a toe-touch sample without needing inputs." }
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
