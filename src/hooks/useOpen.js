import { CHAT_UI_REOPEN } from "@/utils/constants";
import { useState } from "react";

export default function useOpenChat() {
  const [isOpen, setOpen] = useState(false); // Always start closed

  function toggleOpenChat(newValue) {
    if (newValue === true) window.localStorage.setItem(CHAT_UI_REOPEN, "1");
    if (newValue === false) window.localStorage.removeItem(CHAT_UI_REOPEN);
    setOpen(newValue);
  }

  return { isChatOpen: isOpen, toggleOpenChat };
}
