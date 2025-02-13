import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import s from "./login.module.scss";
import {FC} from "react";

type FormData = {
  idInstance: string;
  apiTokenInstance: string;
};

export const Login: FC = () => {
  const { register, handleSubmit } = useForm<FormData>();
  const navigate = useNavigate();

  const onSubmit = ({ idInstance, apiTokenInstance }: FormData) => {
    localStorage.setItem("idInstance", idInstance);
    localStorage.setItem("apiTokenInstance", apiTokenInstance);
    navigate("/chat");
  };

  return (
    <div className={s.container}>
      <form className={s.form} onSubmit={handleSubmit(onSubmit)}>
        <input {...register("idInstance")} placeholder="ID Instance" required />
        <input {...register("apiTokenInstance")} placeholder="API Token" required />
        <button type="submit">Log in</button>
      </form>
    </div>
  );
};
