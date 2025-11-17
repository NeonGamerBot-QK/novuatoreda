import { useState, useEffect } from "react";

export function useAccount() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const file = Bun.file("./data.json");
        if (!(await file.exists())) {
          await Bun.write("./data.json", JSON.stringify({}));
          setConfig({});
        } else {
          const data = await file.json();
          setConfig(data);
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const saveAccount = async (user: string, pass: string, userData?: any) => {
    try {
      let userInfo = userData;

      if (!userInfo) {
        const authHeader = `Basic ${Buffer.from(`${user}:${pass}`).toBase64()}`;

        const response = await fetch("http://localhost:3000/get_my_server_info", {
          method: "POST",
          headers: { "Authorization": authHeader },
        });


        userInfo = await response.json();
        if (!response.ok) {
          console.debug(userInfo)
          throw new Error("Failed to fetch user data: " + JSON.stringify(userInfo));
        }

      }

      const newConfig = {
        username: user,
        password: pass,
        setup: true,
        userData: userInfo,
      };
      await Bun.write("./data.json", JSON.stringify(newConfig, null, 2));
      setConfig(newConfig);

      process.exit(0);
    } catch (e) {
      setError(e as Error);
      throw e;
    }
  };

  return { config, loading, error, saveAccount };
}
