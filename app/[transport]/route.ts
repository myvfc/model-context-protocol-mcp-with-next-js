import { createMcpHandler } from "mcp-handler";
import { z } from "zod";

const handler = createMcpHandler(
  async (server) => {
    // --- Built-in echo tool ---
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

    // --- Cheer Pal tool: get_media (returns plain TEXT links; safe for mcp-handler) ---
    server.tool(
      "get_media",
      "Returns sample media info as plain text links.",
      {
        role: z.string(),
        age_band: z.string(),
        topic: z.string(),
      },
      async ({ role, age_band, topic }) => ({
        content: [
          {
            type: "text",
            text:
              `Media for role=${role}, age_band=${age_band}, topic=${topic}\n\n` +
              `Video: https://filesamples.com/samples/video/mp4/sample_640x360.mp4\n` +
              `PDF:   https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`,
          },
        ],
      })
    );
  },
  {
    // Declare tools so clients can "discover" them
    capabilities: {
      tools: {
        echo: { description: "Echo a message" },
        get_media: { description: "Returns sample media info as plain text links." },
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
