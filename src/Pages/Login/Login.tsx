import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import './Login.css';

interface LoginResponse {
  message?: string;
  token?: string; 
}

interface LoginRequest {
  email: string;
  password: string;
}

interface DecodedToken {
  userId: string;
}

const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await fetch("https://student-artifact-exchange-service.onrender.com/api/User/Login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error('Неверный логин или пароль');
  }

  return result;
};

function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Используем useMutation для логина
  const mutation = useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem('userEmail', email);
      if (data.token) {
        localStorage.setItem('authToken', data.token);

        const decodedToken = jwtDecode<DecodedToken>(data.token);
        const userId = decodedToken.userId;
        
        localStorage.setItem('userId', userId);
      }
      navigate('/myNotes');
    },
  });

  const { mutate, isError, isPending, error: mutationError } = mutation;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Выполняем мутацию с данными из формы
    mutate({ email, password });
  };

  return (
    <div className="login">
      <img className="logo" src="src/images/logo.jpg" alt="Logo" />
      <h2 className="login__title">Вход</h2>
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Адрес электронной почты"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error-message">{error}</div>}
        {isError && (
          <div className="error-message">
            {mutationError instanceof Error ? mutationError.message : 'Ошибка при логине'}
          </div>
        )}
        <button type="submit" className="login__btn" disabled={isPending}>
          {isPending ? 'Загрузка...' : 'Войти'}
        </button>
      </form>
      <Link to="/registration" className="no__account">Нет аккаунта?</Link>
    </div>
  );
}

export default Login;
