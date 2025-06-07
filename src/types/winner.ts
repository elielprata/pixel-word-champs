
export interface Winner {
  id: string;
  username: string;
  position: number;
  pixKey: string;
  holderName: string;
  consolidatedDate: string;
  prize: number;
  paymentStatus: 'pending' | 'paid' | 'cancelled';
}
