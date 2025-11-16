import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import { useState } from "react";
import { Badge, Alert } from "@inkjs/ui";
import { useAccount } from "./getAccountDetails";

export function handleSetup() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordFocused, focusPassword] = useState(false);
  const { saveAccount } = useAccount();
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
          onSubmit={() => {
            saveAccount(name, password);
          }}
        />
      </Box>
    </Box>
  );
}
