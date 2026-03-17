
import { TransactionType } from "@/types/banking";

export const getTransactionTypeLabel = (type: TransactionType): string => {
  switch (type) {
    case "deposit": return "de dépôt";
    case "withdrawal": return "de retrait";
    case "transfer": return "de virement";
  }
};
