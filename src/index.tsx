#!/usr/bin/env bun
import React, { useEffect, useState } from "react";
import { render, Box, Text } from "ink";
import socketIoClient from "socket.io-client";
import { useAccount } from "./utils/getAccountDetails";
import { HandleSetup } from "./utils/tut";

const Counter = () => {
  const account = useAccount();
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [rocks, setRocks] = useState<any[]>([]);

  useEffect(() => {
    if (account.config?.setup) {
      const authHeader = `Basic ${btoa(`${account.config.username}:${account.config.password}`)}`;

      const socket = socketIoClient("http://localhost:3000", {
        extraHeaders: {
          authorization: authHeader,
        },
      });

      socket.on("connect", () => {
        setConnected(true);

        fetch("http://localhost:3000/space_rocks")
          .then((res) => res.json())
          .then((data: any) => setRocks(data))
          .catch((e) => setError(e.message));
      });

      socket.on("connect_error", (e) => {
        setError(e.message);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [account.config?.setup]);

  if (!account.config?.setup) {
    return <HandleSetup />;
  }

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="redBright">❌ Connection Error</Text>
        <Text dimColor>{error}</Text>
      </Box>
    );
  }

  if (!connected) {
    return (
      <Box padding={1}>
        <Text dimColor>Connecting...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="round" borderColor="green" padding={1} marginBottom={1}>
        <Text bold color="green">
          ✓ Connected as {account.config.username}
        </Text>
        {account.config.userData && (
          <Text dimColor> (ID: {account.config.userData.id})</Text>
        )}
      </Box>

      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="cyan"
        padding={1}
      >
        <Text bold color="cyan">
          🪨 Space Rocks ({rocks.length})
        </Text>
        <Box flexDirection="column" marginTop={1}>
          {rocks.map((rock, i) => (
            <Box key={i} marginY={0}>
              <Text color="yellow">• </Text>
              <Text bold>{rock.name}</Text>
              <Text dimColor> - Density: {rock.density}</Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

process.on("uncaughtException", (err) => {
  console.error(err);
  Bun.write(Bun.file("err.txt"), err.stack || err.message);
});

process.on("unhandledRejection", (err: any) => {
  console.error(err);

  Bun.write(Bun.file("err.txt"), err.stack || err.message);
});
render(<Counter />);
