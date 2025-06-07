
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Word {
  id: string;
  level: number;
  word: string;
  category: string;
  difficulty: string;
  is_active: boolean;
}

export const WordsManagement = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [newWord, setNewWord] = useState({
    level: 1,
    word: '',
    category: '',
    difficulty: 'medium'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchWords();
  }, []);

  useEffect(() => {
    filterWords();
  }, [words, searchTerm, levelFilter, difficultyFilter]);

  const fetchWords = async () => {
    try {
      const { data, error } = await supabase
        .from('level_words')
        .select('*')
        .order('level', { ascending: true })
        .order('word', { ascending: true });

      if (error) throw error;
      setWords(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as palavras",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterWords = () => {
    let filtered = words;

    if (searchTerm) {
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      filtered = filtered.filter(word => word.level === parseInt(levelFilter));
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(word => word.difficulty === difficultyFilter);
    }

    setFilteredWords(filtered);
  };

  const addWord = async () => {
    try {
      const { error } = await supabase
        .from('level_words')
        .insert([{
          level: newWord.level,
          word: newWord.word.toUpperCase(),
          category: newWord.category,
          difficulty: newWord.difficulty
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Palavra adicionada com sucesso"
      });

      setNewWord({ level: 1, word: '', category: '', difficulty: 'medium' });
      setIsAddModalOpen(false);
      fetchWords();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a palavra",
        variant: "destructive"
      });
    }
  };

  const updateWord = async () => {
    if (!editingWord) return;

    try {
      const { error } = await supabase
        .from('level_words')
        .update({
          level: editingWord.level,
          word: editingWord.word.toUpperCase(),
          category: editingWord.category,
          difficulty: editingWord.difficulty,
          is_active: editingWord.is_active
        })
        .eq('id', editingWord.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Palavra atualizada com sucesso"
      });

      setEditingWord(null);
      fetchWords();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a palavra",
        variant: "destructive"
      });
    }
  };

  const deleteWord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('level_words')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Palavra removida com sucesso"
      });

      fetchWords();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a palavra",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'hard': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'expert': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-slate-800">Gestão de Palavras</CardTitle>
            <p className="text-sm text-slate-600">
              Gerencie as palavras disponíveis para cada nível do jogo
            </p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Palavra
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Palavra</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nível</Label>
                  <Select 
                    value={newWord.level.toString()} 
                    onValueChange={(value) => setNewWord({...newWord, level: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 20}, (_, i) => i + 1).map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          Nível {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Palavra</Label>
                  <Input 
                    value={newWord.word}
                    onChange={(e) => setNewWord({...newWord, word: e.target.value})}
                    placeholder="Digite a palavra"
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input 
                    value={newWord.category}
                    onChange={(e) => setNewWord({...newWord, category: e.target.value})}
                    placeholder="Ex: animais, objetos..."
                  />
                </div>
                <div>
                  <Label>Dificuldade</Label>
                  <Select 
                    value={newWord.difficulty} 
                    onValueChange={(value) => setNewWord({...newWord, difficulty: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addWord} className="w-full">
                  Adicionar Palavra
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar palavra ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Nível" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Array.from({length: 20}, (_, i) => i + 1).map(level => (
                <SelectItem key={level} value={level.toString()}>
                  Nível {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Dificuldade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="easy">Fácil</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="hard">Difícil</SelectItem>
              <SelectItem value="expert">Expert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela de palavras */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Nível</TableHead>
                <TableHead className="font-semibold">Palavra</TableHead>
                <TableHead className="font-semibold">Categoria</TableHead>
                <TableHead className="font-semibold">Dificuldade</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWords.map((word) => (
                <TableRow key={word.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{word.level}</TableCell>
                  <TableCell className="font-mono font-bold">{word.word}</TableCell>
                  <TableCell className="capitalize">{word.category}</TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(word.difficulty)}>
                      {word.difficulty === 'easy' ? 'Fácil' : 
                       word.difficulty === 'medium' ? 'Médio' : 
                       word.difficulty === 'hard' ? 'Difícil' : 'Expert'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={word.is_active ? 'default' : 'secondary'}>
                      {word.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingWord(word)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteWord(word.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredWords.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || levelFilter !== 'all' || difficultyFilter !== 'all' 
              ? 'Nenhuma palavra encontrada com os filtros aplicados'
              : 'Nenhuma palavra cadastrada'
            }
          </div>
        )}

        {/* Modal de edição */}
        {editingWord && (
          <Dialog open={!!editingWord} onOpenChange={() => setEditingWord(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Palavra</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nível</Label>
                  <Select 
                    value={editingWord.level.toString()} 
                    onValueChange={(value) => setEditingWord({...editingWord, level: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 20}, (_, i) => i + 1).map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          Nível {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Palavra</Label>
                  <Input 
                    value={editingWord.word}
                    onChange={(e) => setEditingWord({...editingWord, word: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Input 
                    value={editingWord.category}
                    onChange={(e) => setEditingWord({...editingWord, category: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Dificuldade</Label>
                  <Select 
                    value={editingWord.difficulty} 
                    onValueChange={(value) => setEditingWord({...editingWord, difficulty: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={updateWord} className="w-full">
                  Salvar Alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};
