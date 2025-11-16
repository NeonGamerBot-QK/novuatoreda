#!/usr/bin/env bun
import React, { useEffect, useState } from "react";
import { render, Box, Text } from "ink";
import socketIoClient from "socket.io-client";

const Counter = () => {
  const account = useAccount();
  const socket = socketIoClient("http://localhost:3000");
  const [error, setError] = useState<string | null>(null);
  socket.on("connect_error", (e) => {
    setError(e.message);
  });
  if (error) {
    return (
      <Box>
        <Text color={"redBright"}>{error}</Text>
      </Box>
    );
  }
  return (
    <Box>
      <Text>sorry im working on backend rn</Text>
    </Box>
  );
};

render(<Counter />);
