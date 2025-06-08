
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, Gamepad2, Trophy, Ban, Target } from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const UserDetailModal = ({ isOpen, onClose, user }: UserDetailModalProps) => {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Informações Básicas */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{user.username}</h3>
                <p className="text-sm text-slate-600">{user.email}</p>
              </div>
            </div>

            <div className="flex gap-2">
              {user.roles.map((role: string) => (
                <Badge
                  key={role}
                  className={
                    role === 'admin'
                      ? 'bg-purple-100 text-purple-800 border-purple-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }
                >
                  {role === 'admin' ? 'Administrador' : 'Usuário'}
                </Badge>
              ))}
              {user.is_banned && (
                <Badge className="bg-red-100 text-red-800 border-red-200">
                  Banido
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Pontuações e Estatísticas */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Pontuações e Estatísticas
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-2 bg-slate-50 rounded border">
                <div className="text-xs text-slate-500">Pontuação Total</div>
                <div className="font-medium">{user.total_score.toLocaleString()}</div>
              </div>
              <div className="p-2 bg-slate-50 rounded border">
                <div className="text-xs text-slate-500">Jogos Realizados</div>
                <div className="font-medium">{user.games_played}</div>
              </div>
              <div className="p-2 bg-slate-50 rounded border">
                <div className="text-xs text-slate-500">Melhor Posição Diária</div>
                <div className="font-medium">{user.best_daily_position || 'N/A'}</div>
              </div>
              <div className="p-2 bg-slate-50 rounded border">
                <div className="text-xs text-slate-500">Melhor Posição Semanal</div>
                <div className="font-medium">{user.best_weekly_position || 'N/A'}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Estatísticas de Jogo - Mantendo a seção original mas reorganizada */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              Resumo de Performance
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Pontuação</span>
                </div>
                <p className="text-lg font-bold text-blue-900">{user.total_score.toLocaleString()}</p>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Gamepad2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Jogos</span>
                </div>
                <p className="text-lg font-bold text-green-900">{user.games_played}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Informações de Cadastro */}
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Informações de Cadastro
            </h4>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-slate-600">Data de cadastro:</span>
                <span className="ml-2 font-medium">
                  {new Date(user.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div>
                <span className="text-slate-600">ID do usuário:</span>
                <span className="ml-2 font-mono text-xs bg-slate-100 px-1 rounded">
                  {user.id}
                </span>
              </div>
            </div>
          </div>

          {/* Informações de Banimento */}
          {user.is_banned && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium text-red-700 flex items-center gap-2">
                  <Ban className="h-4 w-4" />
                  Informações de Banimento
                </h4>
                
                <div className="space-y-2 text-sm">
                  {user.banned_at && (
                    <div>
                      <span className="text-slate-600">Data do banimento:</span>
                      <span className="ml-2 font-medium">
                        {new Date(user.banned_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  
                  {user.ban_reason && (
                    <div>
                      <span className="text-slate-600">Motivo:</span>
                      <p className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                        {user.ban_reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
