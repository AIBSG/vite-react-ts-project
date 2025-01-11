import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {jwtDecode} from 'jwt-decode';
import './RegistrationPage.css';

interface RegisterResponse {
  message?: string;
  success?: boolean;
  token?: string;
}

interface RegisterRequest {
  email: string;
  password: string;
}

interface DecodedToken {
  userId: string;
}

const registerUser = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await fetch("https://student-artifact-exchange-service.onrender.com/api/User/Register", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const text = await response.text();
  const result = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error('Ошибка при регистрации');
  }

  return result;
};

const RegistrationPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  // Используем useMutation для регистрации
  const mutation = useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: registerUser,
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

    // Проверка на совпадение паролей
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setError('');
    mutate({ email, password });
  };

  return (
    <div className="registration">
      <img src="src/images/logo.jpg" alt="Logo" />
      <h2 className="registration__title">Регистрация</h2>
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
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
          title="Должен содержать по крайней мере одну цифру, по одной заглавной и строчной букве и не менее 8 или более символов"
          required
        />
        <input
          type="password"
          placeholder="Подтвердите пароль"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
          title="Должен содержать по крайней мере одну цифру, по одной заглавной и строчной букве и не менее 8 или более символов"
          required
        />
        {error && <div className="error-message">{error}</div>}
        {isError && (
          <div className="error-message">
            {mutationError instanceof Error ? mutationError.message : 'Ошибка сети. Попробуйте позже.'}
          </div>
        )}
        <button type="submit" className="registration__btn" disabled={isPending}>
          {isPending ? 'Загрузка...' : 'Зарегистрироваться'}
        </button>
      </form>
      <Link to="/login" className="has__account">Уже есть аккаунт?</Link>
    </div>
  );
}

export default RegistrationPage;
