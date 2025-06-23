
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Send, X } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

interface AdminErrorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminErrorReportModal = ({ isOpen, onClose }: AdminErrorReportModalProps) => {
  const [reportType, setReportType] = useState('');
  const [severity, setSeverity] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const reportTypes = [
    { value: 'system_error', label: 'Erro do Sistema' },
    { value: 'data_inconsistency', label: 'Inconsistência de Dados' },
    { value: 'performance_issue', label: 'Problema de Performance' },
    { value: 'security_concern', label: 'Questão de Segurança' },
    { value: 'ui_bug', label: 'Bug da Interface' },
    { value: 'other', label: 'Outro' }
  ];

  const severityLevels = [
    { value: 'critical', label: 'Crítico' },
    { value: 'high', label: 'Alto' },
    { value: 'medium', label: 'Médio' },
    { value: 'low', label: 'Baixo' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      logger.info('Enviando relatório de erro admin', { 
        reportType, 
        severity, 
        title 
      }, 'ADMIN_ERROR_REPORT');

      const reportData = {
        user_id: user.id,
        report_type: 'admin_error',
        subject: `[${severity.toUpperCase()}] ${title}`,
        message: `Tipo: ${reportTypes.find(t => t.value === reportType)?.label}\n\nDescrição:\n${description}\n\nPassos para reproduzir:\n${stepsToReproduce}`,
        priority: severity,
        status: 'pending'
      };

      const { error } = await supabase
        .from('user_reports')
        .insert(reportData);

      if (error) throw error;

      logger.info('Relatório de erro enviado com sucesso', { reportType }, 'ADMIN_ERROR_REPORT');
      
      toast({
        title: "Relatório enviado",
        description: "O relatório de erro foi enviado com sucesso para análise.",
      });
      
      // Reset form
      setReportType('');
      setSeverity('');
      setTitle('');
      setDescription('');
      setStepsToReproduce('');
      onClose();
    } catch (error: any) {
      logger.error('Erro ao enviar relatório', { error: error.message }, 'ADMIN_ERROR_REPORT');
      toast({
        title: "Erro ao enviar relatório",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Reportar Erro do Sistema
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportType">Tipo do Problema *</Label>
              <Select value={reportType} onValueChange={setReportType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="severity">Severidade *</Label>
              <Select value={severity} onValueChange={setSeverity} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a severidade" />
                </SelectTrigger>
                <SelectContent>
                  {severityLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="title">Título do Problema *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Descreva brevemente o problema"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição Detalhada *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o problema em detalhes..."
              className="h-24"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="steps">Passos para Reproduzir</Label>
            <Textarea
              id="steps"
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              placeholder="1. Acesse a página...&#10;2. Clique em...&#10;3. O erro ocorre quando..."
              className="h-20"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!reportType || !severity || !title || !description || isSubmitting}
            >
              {isSubmitting ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Relatório
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
