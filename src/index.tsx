#!/usr/bin/env bun
import React, { useEffect, useState } from "react";
import { render, Box, Text } from "ink";
import socketIoClient from "socket.io-client";
import { useAccount } from "./utils/getAccountDetails";
import { handleSetup } from "./utils/tut";

const Counter = () => {
  const account = useAccount();
  if (!account.config?.setup) {
    return handleSetup();
  }
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

process.on("uncaughtException", (err) => {
  console.error(err);
  Bun.write(Bun.file("err.txt"), err.stack || err.message);
});

process.on("unhandledRejection", (err: any) => {
  console.error(err);

  Bun.write(Bun.file("err.txt"), err.stack || err.message);
});
render(<Counter />);
