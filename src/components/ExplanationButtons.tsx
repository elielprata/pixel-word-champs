
import React, { useState } from 'react';
import { Gamepad, Trophy, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import ExplanationModal from './ExplanationModal';

const ExplanationButtons = () => {
  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({
    isOpen: false,
    title: '',
    content: ''
  });

  const explanations = {
    challenges: {
      title: "Desafios Diários",
      content: "Participe dos nossos desafios diários e teste seus conhecimentos! Cada dia traz um novo desafio com diferentes níveis de dificuldade. Complete os desafios para ganhar pontos e subir no ranking."
    },
    prizes: {
      title: "Prêmios Reais",
      content: "Ganhe prêmios incríveis ao participar dos nossos desafios! Oferecemos premiações em dinheiro via PIX para os melhores colocados. Quanto melhor sua performance, maiores as chances de ganhar."
    },
    competitions: {
      title: "Competições",
      content: "Entre em competições emocionantes com outros jogadores! Mostre suas habilidades, suba no ranking e compete pelos melhores prêmios. As competições acontecem regularmente com diferentes temas."
    }
  };

  const openModal = (type: keyof typeof explanations) => {
    const explanation = explanations[type];
    setModalData({
      isOpen: true,
      title: explanation.title,
      content: explanation.content
    });
  };

  const closeModal = () => {
    setModalData({
      isOpen: false,
      title: '',
      content: ''
    });
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mx-4 mb-6">
      <div className="flex justify-around items-center">
        <Button
          variant="ghost"
          className="flex flex-col items-center space-y-2 text-white hover:bg-white/20 p-4 rounded-lg transition-all duration-200"
          onClick={() => openModal('challenges')}
        >
          <Gamepad className="w-8 h-8" />
          <span className="text-sm font-medium">Desafios Diários</span>
        </Button>

        <Button
          variant="ghost"
          className="flex flex-col items-center space-y-2 text-white hover:bg-white/20 p-4 rounded-lg transition-all duration-200"
          onClick={() => openModal('prizes')}
        >
          <Trophy className="w-8 h-8" />
          <span className="text-sm font-medium">Prêmios Reais</span>
        </Button>

        <Button
          variant="ghost"
          className="flex flex-col items-center space-y-2 text-white hover:bg-white/20 p-4 rounded-lg transition-all duration-200"
          onClick={() => openModal('competitions')}
        >
          <Users className="w-8 h-8" />
          <span className="text-sm font-medium">Competições</span>
        </Button>
      </div>

      <ExplanationModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        title={modalData.title}
        content={modalData.content}
      />
    </div>
  );
};

export default ExplanationButtons;
