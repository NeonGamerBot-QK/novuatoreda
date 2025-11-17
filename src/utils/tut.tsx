import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useState } from "react";
import { Badge, Alert } from "@inkjs/ui";
import { useAccount } from "./getAccountDetails";

export function HandleSetup() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordFocused, focusPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveAccount } = useAccount();

  const handleRegister = async () => {
    if (!name || !password) {
      setError("Username and password required");
      return;
    }

    try {
      const hashedPassword = await Bun.password.hash(password);

      const regResponse = await fetch(
        "http://localhost:3000/register_account",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, passhash: hashedPassword }),
        },
      );

      if (!regResponse.ok) {
        const data: any = await regResponse.json();
        setError(data.message || "Registration failed");
        return;
      }

      const authHeader = `Basic ${Buffer.from(`${name}:${password}`).toBase64()}`;
      const userResponse = await fetch(
        "http://localhost:3000/get_my_server_info",
        {
          method: "POST",
          headers: { Authorization: authHeader },
        },
      );

      if (!userResponse.ok) {
        setError("Failed to fetch user data 1 " + (await userResponse.text()));
        return;
      }

      const userData = await userResponse.json();
      await saveAccount(name, password, userData);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Box
      flexDirection="column"
      padding={1}
      borderStyle="round"
      borderColor="cyan"
    >
      <Box marginBottom={1}>
        <Text bold color="magenta">
          🔐 Account Setup
        </Text>
      </Box>

      <Box marginRight={2}>
        <Text dimColor={passwordFocused}>Enter your </Text>
        <Text bold color="cyan">
          username
        </Text>
        <Text dimColor>:</Text>
      </Box>

      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <TextInput
          value={name}
          onChange={setName}
          showCursor={true}
          focus={!passwordFocused}
          onSubmit={() => {
            focusPassword(true);
          }}
        />
      </Box>

      <Box marginRight={2}>
        <Text dimColor={!passwordFocused}>Enter your </Text>
        <Text bold color="cyan">
          password
        </Text>
        <Text dimColor>:</Text>
      </Box>
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <TextInput
          value={password}
          onChange={setPassword}
          showCursor={true}
          mask="*"
          focus={passwordFocused}
          onSubmit={handleRegister}
        />
      </Box>

      {error && (
        <Box marginTop={1}>
          <Text color="red">{error}</Text>
        </Box>
      )}
    </Box>
  );
}
