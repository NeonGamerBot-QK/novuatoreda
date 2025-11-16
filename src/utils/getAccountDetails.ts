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

  const saveAccount = async (username: string, password: string) => {
    try {
      const newConfig = {
        username,
        password,
        setup: true,
        passwordHash: Bun.password.hashSync(password),
      };
      await Bun.write("./data.json", JSON.stringify(newConfig, null, 2));
      setConfig(newConfig);
    } catch (e) {
      setError(e as Error);
    }
  };

  return { config, loading, error, saveAccount };
}
