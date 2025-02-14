import { FC } from "react";
import s from "./chat.module.scss";

export const Chat: FC = () => {
  return (
    <div className={s.chat}>
      <h1>Whatsapp chat</h1>
      <p>Some chat</p>
    </div>
  );
};
