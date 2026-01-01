import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Gift, Plus, Trash, Eye, PencilSquare } from "@medusajs/icons";
import { 
  Container, 
  Heading, 
  Table, 
  Button,
  Badge,
  Text,
  usePrompt,
  toast,
  Input,
  Label,
  Textarea,
  Select,
  Drawer,
  clx
} from "@medusajs/ui";
import { useEffect, useState, useCallback } from "react";

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
};

type GiftCardResponse = {
  gift_cards: GiftCard[];
  count: number;
  offset: number;
  limit: number;
};

const CURRENCY_OPTIONS = [
  { value: "usd", label: "USD - US Dollar" },
  { value: "eur", label: "EUR - Euro" },
  { value: "gbp", label: "GBP - British Pound" },
  { value: "cad", label: "CAD - Canadian Dollar" },
  { value: "aud", label: "AUD - Australian Dollar" },
  { value: "inr", label: "INR - Indian Rupee" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "used", label: "Used" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
];

const GiftCardsPage = () => {  
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(20);
  const prompt = usePrompt();
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCard | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    initial_value: "",
    currency_code: "usd",
    recipient_email: "",
    recipient_name: "",
    message: "",
    purchaser_email: "",
    expires_in_days: "",
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    balance: "",
    status: "",
    recipient_name: "",
    message: "",
  });  const fetchGiftCards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/admin/giftcards?offset=${offset}&limit=${limit}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch gift cards");
      }
      
      const data: GiftCardResponse = await response.json();
      setGiftCards(data.gift_cards || []);
      setCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching gift cards:", error);
      toast.error("Error", {
        description: "Failed to load gift cards",
      });
      setGiftCards([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [offset, limit]);

  useEffect(() => {
    fetchGiftCards();
  }, [fetchGiftCards]);

  const formatCurrency = (amount: number, currencyCode: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currencyCode.toUpperCase(),
      }).format(amount);
    } catch {
      return `${amount} ${currencyCode.toUpperCase()}`;
    }
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // Reset create form
  const resetCreateForm = () => {
    setCreateForm({
      initial_value: "",
      currency_code: "usd",
      recipient_email: "",
      recipient_name: "",
      message: "",
      purchaser_email: "",
      expires_in_days: "",
    });
  };

  // Create Gift Card
  const handleCreate = async () => {
    if (!createForm.initial_value || !createForm.recipient_email) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields",
      });
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        initial_value: parseFloat(createForm.initial_value),
        currency_code: createForm.currency_code,
        recipient_email: createForm.recipient_email,
        recipient_name: createForm.recipient_name || undefined,
        message: createForm.message || undefined,
        purchaser_email: createForm.purchaser_email || undefined,
        expires_in_days: createForm.expires_in_days ? parseInt(createForm.expires_in_days) : undefined,
      };      const response = await fetch("/admin/giftcards", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create gift card");
      }

      const data = await response.json();
      
      toast.success("Success", {
        description: `Gift card created with code: ${data.gift_card?.code || 'N/A'}`,
      });
      
      setShowCreateModal(false);
      resetCreateForm();
      fetchGiftCards();
    } catch (error) {
      console.error("Error creating gift card:", error);
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to create gift card",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // View Gift Card - opens view/edit dialog
  const handleView = (giftCard: GiftCard) => {
    setSelectedGiftCard(giftCard);
    setEditForm({
      balance: giftCard.balance.toString(),
      status: giftCard.status,
      recipient_name: giftCard.recipient_name || "",
      message: giftCard.message || "",
    });
    setIsEditMode(false);
    setShowViewModal(true);
  };

  // Toggle edit mode in view dialog
  const toggleEditMode = () => {
    if (selectedGiftCard) {
      setEditForm({
        balance: selectedGiftCard.balance.toString(),
        status: selectedGiftCard.status,
        recipient_name: selectedGiftCard.recipient_name || "",
        message: selectedGiftCard.message || "",
      });
    }
    setIsEditMode(!isEditMode);
  };
  // Save Edit from view dialog
  const handleSaveFromView = async () => {
    if (!selectedGiftCard) return;

    setFormLoading(true);
    try {
      const payload = {
        balance: parseFloat(editForm.balance),
        status: editForm.status,
        recipient_name: editForm.recipient_name || null,
        message: editForm.message || null,
      };      const response = await fetch(`/admin/giftcards/${selectedGiftCard.id}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update gift card");
      }

      const data = await response.json();
      
      // Update the selected gift card with new data
      if (data.gift_card) {
        setSelectedGiftCard(data.gift_card);
      }

      toast.success("Success", {
        description: "Gift card updated successfully",
      });
      
      setIsEditMode(false);
      fetchGiftCards();
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update gift card",
      });
    } finally {      setFormLoading(false);
    }
  };

  // Cancel Gift Card (sets status to cancelled)
  const handleCancel = async (id: string) => {
    const confirmed = await prompt({
      title: "Cancel Gift Card",
      description: "Are you sure you want to cancel this gift card? This will prevent it from being used.",
    });    if (confirmed) {
      try {
        const response = await fetch(`/admin/giftcards/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to cancel gift card");
        }

        toast.success("Success", {
          description: "Gift card cancelled successfully",
        });
        fetchGiftCards();
      } catch (error) {
        toast.error("Error", {
          description: "Failed to cancel gift card",
        });
      }
    }
  };

  // Permanently Remove Gift Card (deletes from database)
  const handleRemove = async (id: string) => {
    const confirmed = await prompt({
      title: "Permanently Remove Gift Card",
      description: "This will permanently delete this gift card from the database. This action cannot be undone. Are you sure?",
    });    if (confirmed) {
      try {
        const response = await fetch(`/admin/giftcards/${id}?permanent=true`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to remove gift card");
        }

        toast.success("Success", {
          description: "Gift card permanently removed",
        });
        fetchGiftCards();
      } catch (error) {
        toast.error("Error", {
          description: "Failed to remove gift card",
        });
      }
    }
  };

  // Close view modal
  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedGiftCard(null);
    setIsEditMode(false);
  };

  const totalPages = Math.ceil(count / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Gift Cards</Heading>
          <Text className="text-ui-fg-subtle">
            Manage your gift cards ({count} total)
          </Text>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          <Plus />
          Create Gift Card
        </Button>
      </div>

      {/* Gift Cards Table */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Text>Loading gift cards...</Text>
          </div>
        ) : giftCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Gift className="text-ui-fg-subtle mb-4 h-12 w-12" />
            <Text className="text-ui-fg-subtle">No gift cards found</Text>
            <Text className="text-ui-fg-muted text-sm mb-4">
              Create your first gift card to get started
            </Text>
            <Button variant="secondary" onClick={() => setShowCreateModal(true)}>
              <Plus />
              Create Gift Card
            </Button>
          </div>
        ) : (
          <>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Code</Table.HeaderCell>
                  <Table.HeaderCell>Recipient</Table.HeaderCell>
                  <Table.HeaderCell>Initial Value</Table.HeaderCell>
                  <Table.HeaderCell>Balance</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Created</Table.HeaderCell>
                  <Table.HeaderCell>Expires</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {giftCards.map((giftCard) => (                  <Table.Row 
                    key={giftCard.id}
                    className={clx({
                      "opacity-60": giftCard.status === "cancelled",
                    })}
                  >                    <Table.Cell>
                      <code 
                        className="bg-ui-bg-subtle px-2 py-1 rounded text-sm cursor-pointer hover:bg-ui-bg-subtle-hover"
                        onClick={() => handleView(giftCard)}
                        title="Click to view details"
                      >
                        {giftCard.code}
                      </code>
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <Text className="font-medium">{giftCard.recipient_name || "-"}</Text>
                        <Text className="text-ui-fg-subtle text-sm">
                          {giftCard.recipient_email}
                        </Text>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      {formatCurrency(giftCard.initial_value, giftCard.currency_code)}
                    </Table.Cell>
                    <Table.Cell>
                      {formatCurrency(giftCard.balance, giftCard.currency_code)}
                    </Table.Cell>
                    <Table.Cell>{getStatusBadge(giftCard.status)}</Table.Cell>
                    <Table.Cell>{formatDate(giftCard.created_at)}</Table.Cell>
                    <Table.Cell>{formatDate(giftCard.expires_at)}</Table.Cell>                    <Table.Cell>
                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="small"
                          onClick={() => handleView(giftCard)}
                          title="View and Edit"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {giftCard.status === "cancelled" ? (
                          <Button 
                            variant="danger" 
                            size="small"
                            onClick={() => handleRemove(giftCard.id)}
                            title="Permanently remove"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="danger" 
                            size="small"
                            onClick={() => handleCancel(giftCard.id)}
                            title="Cancel gift card"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Text className="text-ui-fg-subtle text-sm">
                  Page {currentPage} of {totalPages}
                </Text>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={offset === 0}
                    onClick={() => setOffset(Math.max(0, offset - limit))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={currentPage >= totalPages}
                    onClick={() => setOffset(offset + limit)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>      {/* Create Gift Card Modal */}
      <Drawer open={showCreateModal} onOpenChange={setShowCreateModal}>
        <Drawer.Content className="overflow-hidden">
          <Drawer.Header>
            <Drawer.Title>Create Gift Card</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="p-4 space-y-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>{/* Value Section */}
            <div className="space-y-4">
              <Heading level="h2">Gift Card Value</Heading>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create_initial_value">Value *</Label>
                  <Input
                    id="create_initial_value"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="100.00"
                    value={createForm.initial_value}
                    onChange={(e) => setCreateForm({...createForm, initial_value: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create_currency">Currency *</Label>
                  <Select
                    value={createForm.currency_code}
                    onValueChange={(value) => setCreateForm({...createForm, currency_code: value})}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select currency" />
                    </Select.Trigger>
                    <Select.Content>
                      {CURRENCY_OPTIONS.map((option) => (
                        <Select.Item key={option.value} value={option.value}>
                          {option.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              </div>
            </div>

            {/* Recipient Section */}
            <div className="space-y-4">
              <Heading level="h2">Recipient Information</Heading>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create_recipient_email">Recipient Email *</Label>
                  <Input
                    id="create_recipient_email"
                    type="email"
                    placeholder="recipient@example.com"
                    value={createForm.recipient_email}
                    onChange={(e) => setCreateForm({...createForm, recipient_email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create_recipient_name">Recipient Name</Label>
                  <Input
                    id="create_recipient_name"
                    type="text"
                    placeholder="John Doe"
                    value={createForm.recipient_name}
                    onChange={(e) => setCreateForm({...createForm, recipient_name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create_message">Personal Message</Label>
                <Textarea
                  id="create_message"
                  placeholder="Add a personal message..."
                  value={createForm.message}
                  onChange={(e) => setCreateForm({...createForm, message: e.target.value})}
                  rows={3}
                />
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              <Heading level="h2">Additional Options</Heading>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create_purchaser_email">Purchaser Email</Label>
                  <Input
                    id="create_purchaser_email"
                    type="email"
                    placeholder="purchaser@example.com"
                    value={createForm.purchaser_email}
                    onChange={(e) => setCreateForm({...createForm, purchaser_email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create_expires">Expires In (Days)</Label>
                  <Input
                    id="create_expires"
                    type="number"
                    min="1"
                    placeholder="365"
                    value={createForm.expires_in_days}
                    onChange={(e) => setCreateForm({...createForm, expires_in_days: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate} isLoading={formLoading}>
              Create Gift Card
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>      {/* View/Edit Gift Card Dialog */}
      <Drawer open={showViewModal} onOpenChange={(open) => {
        if (!open) closeViewModal();
      }}>
        <Drawer.Content className="overflow-hidden">
          <Drawer.Header>
            <Drawer.Title>
              {isEditMode ? "Edit Gift Card" : "Gift Card Details"}
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>
            {selectedGiftCard && (
              <div className="space-y-6">
                {/* Code & Status Header */}
                <div className="flex items-center justify-between p-4 bg-ui-bg-subtle rounded-lg">
                  <div>
                    <Text className="text-ui-fg-subtle text-sm mb-1">Gift Card Code</Text>
                    <code className="text-lg font-mono font-bold">
                      {selectedGiftCard.code}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditMode ? (
                      <Select
                        value={editForm.status}
                        onValueChange={(value) => setEditForm({...editForm, status: value})}
                      >
                        <Select.Trigger className="w-32">
                          <Select.Value placeholder="Status" />
                        </Select.Trigger>
                        <Select.Content>
                          {STATUS_OPTIONS.map((option) => (
                            <Select.Item key={option.value} value={option.value}>
                              {option.label}
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    ) : (
                      getStatusBadge(selectedGiftCard.status)
                    )}
                  </div>
                </div>

                {/* Value Information */}
                <div className="bg-ui-bg-subtle p-4 rounded-lg">
                  <Heading level="h3" className="mb-3">Value Information</Heading>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Initial Value</Text>
                      <Text className="font-semibold text-lg">
                        {formatCurrency(selectedGiftCard.initial_value, selectedGiftCard.currency_code)}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Current Balance</Text>
                      {isEditMode ? (
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editForm.balance}
                          onChange={(e) => setEditForm({...editForm, balance: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <Text className="font-semibold text-lg text-ui-fg-interactive">
                          {formatCurrency(selectedGiftCard.balance, selectedGiftCard.currency_code)}
                        </Text>
                      )}
                    </div>
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Currency</Text>
                      <Text className="font-medium">{selectedGiftCard.currency_code.toUpperCase()}</Text>
                    </div>
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Times Used</Text>
                      <Text className="font-medium">{selectedGiftCard.used_count}</Text>
                    </div>
                  </div>
                </div>

                {/* Recipient Information */}
                <div className="bg-ui-bg-subtle p-4 rounded-lg">
                  <Heading level="h3" className="mb-3">Recipient Information</Heading>
                  <div className="space-y-3">
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Name</Text>
                      {isEditMode ? (
                        <Input
                          type="text"
                          placeholder="Recipient name"
                          value={editForm.recipient_name}
                          onChange={(e) => setEditForm({...editForm, recipient_name: e.target.value})}
                          className="mt-1"
                        />
                      ) : (
                        <Text className="font-medium">{selectedGiftCard.recipient_name || "-"}</Text>
                      )}
                    </div>                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Email</Text>
                      <Text className="font-medium">{selectedGiftCard.recipient_email}</Text>
                    </div>
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Message</Text>
                      {isEditMode ? (
                        <Textarea
                          placeholder="Personal message"
                          value={editForm.message}
                          onChange={(e) => setEditForm({...editForm, message: e.target.value})}
                          rows={3}
                          className="mt-1"
                        />
                      ) : (
                        <Text className={selectedGiftCard.message ? "italic" : ""}>
                          {selectedGiftCard.message ? `"${selectedGiftCard.message}"` : "-"}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>                {/* Purchase Information */}
                <div className="bg-ui-bg-subtle p-4 rounded-lg">
                  <Heading level="h3" className="mb-3">Purchase Information</Heading>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Purchaser Email</Text>
                      <Text className="font-medium">{selectedGiftCard.purchaser_email || "-"}</Text>
                    </div>
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Order ID</Text>
                      <Text className="font-medium">{selectedGiftCard.order_id || "-"}</Text>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="bg-ui-bg-subtle p-4 rounded-lg">
                  <Heading level="h3" className="mb-3">Timeline</Heading>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Created</Text>
                      <Text className="font-medium">{formatDateTime(selectedGiftCard.created_at)}</Text>
                    </div>
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Purchased</Text>
                      <Text className="font-medium">{formatDateTime(selectedGiftCard.purchased_at)}</Text>
                    </div>
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Email Sent</Text>
                      <Text className="font-medium">{formatDateTime(selectedGiftCard.sent_at)}</Text>
                    </div>
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">First Used</Text>
                      <Text className="font-medium">{formatDateTime(selectedGiftCard.first_used_at)}</Text>
                    </div>
                    <div>
                      <Text className="text-ui-fg-subtle text-sm">Expires</Text>
                      <Text className="font-medium">{formatDateTime(selectedGiftCard.expires_at)}</Text>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Drawer.Body>          <Drawer.Footer>
            <div className="flex justify-between w-full">
              <div>
                {selectedGiftCard && !isEditMode && (
                  <>
                    {selectedGiftCard.status === "cancelled" ? (
                      <Button 
                        variant="danger" 
                        onClick={() => {
                          closeViewModal();
                          handleRemove(selectedGiftCard.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                        Remove Permanently
                      </Button>
                    ) : (
                      <Button 
                        variant="danger" 
                        onClick={() => {
                          closeViewModal();
                          handleCancel(selectedGiftCard.id);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                        Cancel Gift Card
                      </Button>
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {isEditMode ? (
                  <>
                    <Button variant="secondary" onClick={toggleEditMode}>
                      Cancel Edit
                    </Button>
                    <Button variant="primary" onClick={handleSaveFromView} isLoading={formLoading}>
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" onClick={closeViewModal}>
                      Close
                    </Button>
                    <Button variant="primary" onClick={toggleEditMode}>
                      <PencilSquare className="h-4 w-4" />
                      Edit
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Drawer.Footer>        </Drawer.Content>
      </Drawer>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: "Gift Cards",
  icon: Gift,
});

export default GiftCardsPage;
