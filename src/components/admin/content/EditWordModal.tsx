
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLevelWords } from '@/hooks/useLevelWords';
import type { WordCategory } from '@/hooks/useWordCategories';

interface EditWordModalProps {
  word: any;
  isOpen: boolean;
  onClose: () => void;
  categories: WordCategory[];
}

export const EditWordModal = ({ word, isOpen, onClose, categories }: EditWordModalProps) => {
  const [wordText, setWordText] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const { updateWord, isUpdating } = useLevelWords();

  useEffect(() => {
    if (word) {
      setWordText(word.word || '');
      setCategory(word.category || '');
      setDifficulty(word.difficulty || '');
    }
  }, [word]);

  const handleSave = () => {
    if (!wordText.trim()) return;

    updateWord({
      id: word.id,
      word: wordText.trim(),
      category: category || undefined,
      difficulty: difficulty || undefined,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Palavra</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="word">Palavra</Label>
            <Input
              id="word"
              value={wordText}
              onChange={(e) => setWordText(e.target.value.toUpperCase())}
              placeholder="Digite a palavra..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sem categoria</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Dificuldade</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil (3-4 letras)</SelectItem>
                <SelectItem value="medium">Médio (5-6 letras)</SelectItem>
                <SelectItem value="hard">Difícil (7-8 letras)</SelectItem>
                <SelectItem value="expert">Expert (9+ letras)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!wordText.trim() || isUpdating}
          >
            {isUpdating ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
