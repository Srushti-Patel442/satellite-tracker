import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    const loginResponse = await fetch(
      "https://www.space-track.org/ajaxauth/login",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          identity: process.env.SPACE_TRACK_EMAIL!,
          password: process.env.SPACE_TRACK_PASSWORD!,
        }),
      }
    );

    const cookie =
      loginResponse.headers.get("set-cookie");

    if (!cookie) {
      return res.status(500).json({
        error: "Space-Track login failed",
      });
    }

    const tleResponse = await fetch(
      "https://www.space-track.org/basicspacedata/query/class/gp/limit/3000/format/json",
      {
        headers: {
          Cookie: cookie,
        },
      }
    );

    const data = await tleResponse.json();

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({
      error: error.message,
    });
  }
}