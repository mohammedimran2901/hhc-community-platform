import dynamic from 'next/dynamic';

const RegisterForm = dynamic(
  () => import('@/components/auth/RegisterForm'),
  { ssr: false }
);

export default function RegisterPage() {
  return <RegisterForm />;
}