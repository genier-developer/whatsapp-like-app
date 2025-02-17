import {FC, useEffect, useState} from "react";
import s from "./chat.module.scss";
import {useForm} from "react-hook-form";
import axios from "axios";
import {useNavigate} from "react-router-dom";

type Message = {
  text: string;
  fromUser: boolean;
}
export const Chat: FC = () => {
  const {register, reset, handleSubmit} = useForm<{text: string}>()
  const [messages, setMessages] = useState<Message[]>([]);
  const idInstance = localStorage.getItem("idInstance");
  const apiTokenInstance = localStorage.getItem("apiTokenInstance");
  const navigate = useNavigate();

  useEffect(()=>{
    if (!idInstance || !apiTokenInstance) {
      navigate("/");
    }
  }, [idInstance, apiTokenInstance, navigate])

  const handleLogout = ()=>{
    localStorage.removeItem('idInstance')
    localStorage.removeItem('apiTokenInstance')
    navigate("/");
  }


  const onSubmit= async ({ text }: { text: string })=> {
    const phoneNumber = "98765432111@c.us";
    const url = `https://api.green-api.com/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

    try{
      await axios.post(url, {
        chatId: phoneNumber,
        message: text
      })
      setMessages((prev)=> [...prev, { text, fromUser: true }])
      reset()
    } catch (error){
      console.error("Some error occurred: ", error)
    }
  }

  return (
    <div className={s.chat}>
      <div className={s.header}>
        <h1>WhatsApp Chat</h1>
        <button className={s.button} onClick={handleLogout}>Logout</button>
      </div>
      <div className={s.messages}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.fromUser ? s.sent : s.received}>
            {msg.text}
          </div>
        ))}
      </div>
        <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
          <input
            className={s.input}
            {...register('text') }
            placeholder="Type a message..."
          />
          <button className={s.button} type='submit'>Send</button>
        </form>


    </div>

  );
};
