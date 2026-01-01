import { defineRouteConfig } from "@medusajs/admin-sdk";
import { ArrowLeft } from "@medusajs/icons";
import { 
  Container, 
  Heading, 
  Button,
  Badge,
  Text,
  toast
} from "@medusajs/ui";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

type GiftCardTransaction = {
  id: string;
  type: "redemption" | "refund" | "adjustment";
  amount: number;
  balance_before: number;
  balance_after: number;
  order_id: string | null;
  notes: string | null;
  created_at: string;
};

type GiftCard = {
  id: string;
  code: string;
  initial_value: number;
  balance: number;
  currency_code: string;
  status: "active" | "used" | "expired" | "cancelled";
  recipient_email: string;
  recipient_name: string | null;
  purchaser_id: string | null;
  purchaser_email: string | null;
  order_id: string | null;
  message: string | null;
  created_at: string;
  purchased_at: string | null;
  sent_at: string | null;
  first_used_at: string | null;
  expires_at: string | null;
  used_count: number;
  metadata: Record<string, any> | null;
};

const GiftCardDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [transactions, setTransactions] = useState<GiftCardTransaction[]>([]);
  const [loading, setLoading] = useState(true);  const fetchGiftCard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/admin/giftcards/${id}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch gift card");
      }
      
      const data = await response.json();
      setGiftCard(data.gift_card);
      setTransactions(data.transactions || []);
    } catch (error) {
      console.error("Error fetching gift card:", error);
      toast.error("Error", {
        description: "Failed to load gift card details",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchGiftCard();
    }
  }, [id]);

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode.toUpperCase(),
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, "green" | "red" | "orange" | "grey"> = {
      active: "green",
      used: "grey",
      expired: "red",
      cancelled: "orange",
    };
    return <Badge color={colors[status] || "grey"}>{status.toUpperCase()}</Badge>;
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Container className="p-6">
        <Text>Loading gift card details...</Text>
      </Container>
    );
  }

  if (!giftCard) {
    return (
      <Container className="p-6">
        <Text>Gift card not found</Text>
      </Container>
    );
  }

  return (
    <Container className="divide-y p-0">      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link to="/giftcards">
            <Button variant="secondary" size="small">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <Heading level="h1">Gift Card Details</Heading>
            <Text className="text-ui-fg-subtle">
              <code className="bg-ui-bg-subtle px-2 py-1 rounded">{giftCard.code}</code>
            </Text>
          </div>
        </div>
        <div className="flex gap-2">
          {getStatusBadge(giftCard.status)}
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-2 gap-6 px-6 py-4">
        <div className="space-y-4">
          <Heading level="h2">Value Information</Heading>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="text-ui-fg-subtle text-sm">Initial Value</Text>
              <Text className="font-semibold text-lg">
                {formatCurrency(giftCard.initial_value, giftCard.currency_code)}
              </Text>
            </div>
            <div>
              <Text className="text-ui-fg-subtle text-sm">Current Balance</Text>
              <Text className="font-semibold text-lg text-ui-fg-interactive">
                {formatCurrency(giftCard.balance, giftCard.currency_code)}
              </Text>
            </div>
            <div>
              <Text className="text-ui-fg-subtle text-sm">Currency</Text>
              <Text className="font-medium">{giftCard.currency_code.toUpperCase()}</Text>
            </div>
            <div>
              <Text className="text-ui-fg-subtle text-sm">Times Used</Text>
              <Text className="font-medium">{giftCard.used_count}</Text>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Heading level="h2">Recipient Information</Heading>
          <div className="space-y-2">
            <div>
              <Text className="text-ui-fg-subtle text-sm">Name</Text>
              <Text className="font-medium">{giftCard.recipient_name || "-"}</Text>
            </div>
            <div>
              <Text className="text-ui-fg-subtle text-sm">Email</Text>
              <Text className="font-medium">{giftCard.recipient_email}</Text>
            </div>
            {giftCard.message && (
              <div>
                <Text className="text-ui-fg-subtle text-sm">Message</Text>
                <Text className="italic">"{giftCard.message}"</Text>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchaser Info */}
      <div className="px-6 py-4">
        <Heading level="h2" className="mb-4">Purchase Information</Heading>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Text className="text-ui-fg-subtle text-sm">Purchaser Email</Text>
            <Text className="font-medium">{giftCard.purchaser_email || "-"}</Text>
          </div>
          <div>
            <Text className="text-ui-fg-subtle text-sm">Purchaser ID</Text>
            <Text className="font-medium">{giftCard.purchaser_id || "-"}</Text>
          </div>
          <div>
            <Text className="text-ui-fg-subtle text-sm">Order ID</Text>
            <Text className="font-medium">{giftCard.order_id || "-"}</Text>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="px-6 py-4">
        <Heading level="h2" className="mb-4">Timeline</Heading>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Text className="text-ui-fg-subtle text-sm">Created</Text>
            <Text className="font-medium">{formatDateTime(giftCard.created_at)}</Text>
          </div>
          <div>
            <Text className="text-ui-fg-subtle text-sm">Purchased</Text>
            <Text className="font-medium">{formatDateTime(giftCard.purchased_at)}</Text>
          </div>
          <div>
            <Text className="text-ui-fg-subtle text-sm">Email Sent</Text>
            <Text className="font-medium">{formatDateTime(giftCard.sent_at)}</Text>
          </div>
          <div>
            <Text className="text-ui-fg-subtle text-sm">First Used</Text>
            <Text className="font-medium">{formatDateTime(giftCard.first_used_at)}</Text>
          </div>
          <div>
            <Text className="text-ui-fg-subtle text-sm">Expires</Text>
            <Text className="font-medium">{formatDateTime(giftCard.expires_at)}</Text>
          </div>
        </div>
      </div>      {/* Transactions */}
      {transactions && transactions.length > 0 && (
        <div className="px-6 py-4">
          <Heading level="h2" className="mb-4">Transaction History</Heading>
          <div className="space-y-2">
            {transactions.map((tx: GiftCardTransaction) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-ui-bg-subtle rounded">
                <div>
                  <Badge color={tx.type === "redemption" ? "red" : tx.type === "refund" ? "green" : "grey"}>
                    {tx.type.toUpperCase()}
                  </Badge>
                  <Text className="ml-2 text-sm">{tx.notes || "-"}</Text>
                </div>
                <div className="text-right">
                  <Text className={`font-medium ${tx.type === "redemption" ? "text-ui-fg-error" : "text-ui-fg-interactive"}`}>
                    {tx.type === "redemption" ? "-" : "+"}{formatCurrency(tx.amount, giftCard.currency_code)}
                  </Text>
                  <Text className="text-ui-fg-subtle text-sm">
                    Balance: {formatCurrency(tx.balance_after, giftCard.currency_code)}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Gift Card Details",
});

export default GiftCardDetailPage;
