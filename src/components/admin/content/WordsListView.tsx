
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit3,
  Filter,
  BookOpen
} from 'lucide-react';
import { useLevelWords } from '@/hooks/useLevelWords';
import { useWordCategories } from '@/hooks/useWordCategories';
import { EditWordModal } from './EditWordModal';

export const WordsListView = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [editingWord, setEditingWord] = useState<any>(null);

  const { categories } = useWordCategories();
  
  const { 
    wordsData, 
    isLoading, 
    deleteWord, 
    isDeleting 
  } = useLevelWords({
    page: currentPage,
    limit: 50,
    search: searchTerm || undefined,
    category: selectedCategory || undefined,
    difficulty: selectedDifficulty || undefined,
    level: selectedLevel ? parseInt(selectedLevel) : undefined,
  });

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type: string, value: string) => {
    switch (type) {
      case 'category':
        setSelectedCategory(value);
        break;
      case 'difficulty':
        setSelectedDifficulty(value);
        break;
      case 'level':
        setSelectedLevel(value);
        break;
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedLevel('');
    setCurrentPage(1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      case 'expert': return 'Expert';
      default: return difficulty;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-slate-500">Carregando palavras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lista de Palavras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {wordsData?.totalCount || 0}
              </div>
              <div className="text-sm text-slate-600">Total de Palavras</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {categories?.length || 0}
              </div>
              <div className="text-sm text-slate-600">Categorias</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {wordsData?.currentPage || 1}
              </div>
              <div className="text-sm text-slate-600">Página Atual</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {wordsData?.totalPages || 0}
              </div>
              <div className="text-sm text-slate-600">Total de Páginas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Barra de busca */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar palavras..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Limpar
              </Button>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedCategory} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as categorias</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={(value) => handleFilterChange('difficulty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as dificuldades</SelectItem>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={(value) => handleFilterChange('level', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os níveis</SelectItem>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      Nível {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de palavras */}
      <Card>
        <CardContent className="pt-6">
          {wordsData?.words.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-slate-500">Nenhuma palavra encontrada</p>
              <p className="text-sm text-slate-400 mt-1">
                Tente ajustar os filtros ou gerar novas palavras
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Palavra</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Dificuldade</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Criada em</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wordsData?.words.map((word) => (
                    <TableRow key={word.id}>
                      <TableCell className="font-medium">{word.word}</TableCell>
                      <TableCell>
                        {word.category ? (
                          <Badge variant="outline">{word.category}</Badge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getDifficultyColor(word.difficulty)}>
                          {getDifficultyLabel(word.difficulty)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">Nível {word.level}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(word.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingWord(word)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteWord(word.id)}
                            disabled={isDeleting}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              {(wordsData?.totalPages || 0) > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-slate-600">
                    Mostrando {((currentPage - 1) * 50) + 1} a {Math.min(currentPage * 50, wordsData?.totalCount || 0)} de {wordsData?.totalCount} palavras
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={!wordsData?.hasPreviousPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="text-sm">
                      Página {currentPage} de {wordsData?.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      disabled={!wordsData?.hasNextPage}
                    >
                      Próxima
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de edição */}
      {editingWord && (
        <EditWordModal
          word={editingWord}
          isOpen={!!editingWord}
          onClose={() => setEditingWord(null)}
          categories={categories || []}
        />
      )}
    </div>
  );
};
