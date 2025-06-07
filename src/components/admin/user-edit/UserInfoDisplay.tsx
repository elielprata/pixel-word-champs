
import React from 'react';

interface UserInfoDisplayProps {
  username: string;
  email: string;
}

export const UserInfoDisplay = ({ username, email }: UserInfoDisplayProps) => {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Informações do usuário</h4>
      <div className="bg-gray-50 p-3 rounded-lg">
        <p className="text-sm"><strong>Username:</strong> {username}</p>
        <p className="text-sm"><strong>Email:</strong> {email}</p>
      </div>
    </div>
  );
};
