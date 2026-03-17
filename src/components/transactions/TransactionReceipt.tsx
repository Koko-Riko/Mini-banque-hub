
import React, { forwardRef, useEffect, useState } from "react";
import { Transaction } from "@/types/banking";
import { supabase } from "@/integrations/supabase/client";
import { QRCodeSVG } from "qrcode.react";

interface TransactionReceiptProps {
  transaction: Transaction & { balanceBefore?: number; balanceAfter?: number };
  accountInfo?: {
    clientName: string;
    accountNumber: string;
  };
}

interface BankInfo {
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  slogan: string | null;
  logo_url: string | null;
}

const TransactionReceipt = forwardRef<HTMLDivElement, TransactionReceiptProps>(
  ({ transaction, accountInfo }, ref) => {
    const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);

    useEffect(() => {
      const fetchBankInfo = async () => {
        const { data } = await supabase
          .from("bank_info")
          .select("name, address, phone, email, slogan, logo_url")
          .limit(1)
          .single();
        if (data) setBankInfo(data);
      };
      fetchBankInfo();
    }, []);

    const date = new Date(transaction.date);
    const formattedDate = new Intl.DateTimeFormat("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

    const getTransactionTypeLabel = (type: string): string => {
      switch (type) {
        case "deposit": return "Dépôt";
        case "withdrawal": return "Retrait";
        case "transfer": return "Virement";
        case "loan_payment": return "Remboursement prêt";
        case "interest": return "Intérêt";
        default: return type;
      }
    };

    const formatAmount = (amount: number): string => {
      return amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const bankName = bankInfo?.name || "Jaune Multi Services";
    const bankAddress = bankInfo?.address || "";
    const bankPhone = bankInfo?.phone || "";
    const bankSlogan = bankInfo?.slogan || "Votre partenaire financier de confiance";

    return (
      <div
        ref={ref}
        className="bg-white text-black p-6 max-w-sm mx-auto print:shadow-none"
        style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "13px" }}
      >
        {/* Logo */}
        {bankInfo?.logo_url && (
          <div className="flex justify-center mb-3">
            <img src={bankInfo.logo_url} alt={bankName} className="h-14 w-auto object-contain" />
          </div>
        )}

        {/* Header - Bank Info */}
        <div className="text-center mb-4 leading-tight">
          {bankAddress && <p className="text-xs uppercase">{bankAddress}</p>}
          {bankPhone && <p className="text-xs">{bankPhone}</p>}
        </div>

        {/* Bank Name Box */}
        <div className="border-2 border-black mx-auto mb-3 px-4 py-2 text-center" style={{ maxWidth: "200px" }}>
          <h1 className="text-base font-bold uppercase tracking-wide">{bankName}</h1>
        </div>

        {/* Date */}
        <div className="text-center mb-4">
          <p className="text-sm">{formattedDate}</p>
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-3" />

        {/* Transaction Details */}
        <div className="space-y-1 mb-2">
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">N° Transaction:</span>
            <span className="text-xs font-mono">{transaction.id?.slice(0, 8) || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-600">Type:</span>
            <span className="text-xs font-semibold">{getTransactionTypeLabel(transaction.type)}</span>
          </div>
          {accountInfo && (
            <>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Client:</span>
                <span className="text-xs">{accountInfo.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">N° Compte:</span>
                <span className="text-xs font-mono">{accountInfo.accountNumber}</span>
              </div>
            </>
          )}
          {transaction.description && (
            <div className="flex justify-between">
              <span className="text-xs text-gray-600">Description:</span>
              <span className="text-xs text-right max-w-[60%]">{transaction.description}</span>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-3" />

        {/* Amount Section */}
        <div className="space-y-1">
          {transaction.balanceBefore !== undefined && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Solde avant:</span>
              <span>{formatAmount(transaction.balanceBefore)} HTG</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base py-1">
            <span>MONTANT:</span>
            <span>{formatAmount(transaction.amount)} HTG</span>
          </div>
          {transaction.balanceAfter !== undefined && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Solde après:</span>
              <span className="font-semibold">{formatAmount(transaction.balanceAfter)} HTG</span>
            </div>
          )}
        </div>

        {/* QR Code */}
        <div className="flex justify-center my-3">
          <QRCodeSVG
            value={transaction.id || "N/A"}
            size={80}
            level="M"
          />
        </div>
        <p className="text-center text-[10px] text-gray-400 mb-2">Réf: {transaction.id?.slice(0, 12) || "N/A"}</p>

        {/* Separator */}
        <div className="border-t border-dashed border-gray-400 my-3" />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 leading-relaxed">
          <p>{bankSlogan}</p>
          <p className="mt-1">Merci pour votre confiance</p>
        </div>
      </div>
    );
  }
);

TransactionReceipt.displayName = "TransactionReceipt";

export default TransactionReceipt;
