"use client";
import { useState, useEffect } from "react";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

const ingredientSchema = z.object({
  name: z.string().min(1, "Ingredient name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  expiry: z.string().optional(),
});

const COMMON_INGREDIENT_UNITS = [
  { label: "Teaspoon", value: "tsp" },
  { label: "Tablespoon", value: "tbsp" },
  { label: "Cup", value: "cup" },
  { label: "Milliliter", value: "ml" },
  { label: "Liter", value: "l" },
  { label: "Ounce", value: "oz" },
  { label: "Pound", value: "lb" },
  { label: "Gram", value: "g" },
  { label: "Kilogram", value: "kg" },
  { label: "Piece", value: "piece" },
  { label: "Clove", value: "clove" },
  { label: "Slice", value: "slice" },
  { label: "Stick", value: "stick" },
  { label: "Bunch", value: "bunch" },
  { label: "Can", value: "can" },
  { label: "Pack", value: "pack" },
  { label: "Bottle", value: "bottle" },
  { label: "Jar", value: "jar" },
  { label: "Pinch", value: "pinch" },
];

type Ingredient = z.infer<typeof ingredientSchema> & {
  id?: string;
};

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [open, setOpen] = useState(false);
  const [ingredientOptions, setIngredientOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setFormMessage] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editIngredient, setEditIngredient] = useState<Ingredient | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteIngredient, setDeleteIngredient] = useState<Ingredient | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  // Fetch ingredient options for combobox
  useEffect(() => {
    fetch("https://www.themealdb.com/api/json/v1/1/list.php?i=list")
      .then((res) => res.json())
      .then((data) => {
        if (data.meals) {
          setIngredientOptions(
            data.meals.map((item: { strIngredient: string }) => item.strIngredient).filter(Boolean)
          );
        }
      })
      .catch(() => setIngredientOptions([]));
  }, []);

  // Fetch all ingredients from backend
  const fetchIngredients = () => {
    fetch("http://localhost:8000/ingredients")
      .then((res) => res.json())
      .then((data) => setIngredients(data))
      .catch(() => setIngredients([]));
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const form = useForm<Ingredient>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: { name: "", quantity: "", unit: "", expiry: "" },
    mode: "onChange",
  });

  // Handle form submission to backend API
  const onSubmit = async (data: Ingredient) => {
    setLoading(true);
    setFormMessage(null);

    // Prepare payload as required by backend
    const payload = {
      ingredient: {
        name: data.name,
        quantity: Number(data.quantity),
        unit: data.unit,
        expiry: data.expiry || undefined,
      },
    };

    try {
      const res = await fetch("http://localhost:8000/ingredients/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setFormMessage("Ingredient added successfully!");
        setOpen(false);
        form.reset();
        fetchIngredients();
      } else {
        setFormMessage(result.detail || "Failed to add ingredient.");
      }
    } catch (err: unknown) {
      setFormMessage("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const editForm = useForm<Ingredient>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: { name: "", quantity: "", unit: "", expiry: "" },
    mode: "onChange",
  });

  // Open edit dialog and set form values
  const handleEditClick = (ingredient: Ingredient) => {
    setEditIngredient(ingredient);
    editForm.reset({
      name: ingredient.name,
      quantity: String(ingredient.quantity),
      unit: ingredient.unit,
      expiry: ingredient.expiry || "",
    });
    setEditMessage(null);
    setEditOpen(true);
  };

  // Handle edit submit
  const onEditSubmit = async (data: Ingredient) => {
    if (!editIngredient?.id) return;
    setEditLoading(true);
    setEditMessage(null);

    const payload = {
      name: data.name,
      quantity: Number(data.quantity),
      unit: data.unit,
      expiry: data.expiry || undefined,
    };
    try {
      const res = await fetch(
        `http://localhost:8000/ingredients/edit/${editIngredient.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await res.json();

      if (res.ok && result.success) {
        setEditMessage("Ingredient updated successfully!");
        setEditOpen(false);
        fetchIngredients();
      } else {
        setEditMessage(result.detail || "Failed to update ingredient.");
      }
    } catch (err: unknown) {
      setEditMessage("Could not connect to the server.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (ingredient: Ingredient) => {
    setDeleteIngredient(ingredient);
    setDeleteMessage(null);
    setDeleteOpen(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteIngredient?.id) return;
    setDeleteLoading(true);
    setDeleteMessage(null);

    try {
      const res = await fetch(
        `http://localhost:8000/ingredients/delete/${deleteIngredient.id}`,
        { method: "DELETE" }
      );
      const result = await res.json();

      if (res.ok && result.success) {
        setDeleteMessage("Ingredient deleted successfully!");
        setDeleteOpen(false);
        fetchIngredients();
      } else {
        setDeleteMessage(result.detail || "Failed to delete ingredient.");
      }
    } catch (err: unknown) {
      setDeleteMessage("Could not connect to the server.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Label className="flex justify-center mb-2 text-4xl font-semibold text-center">
        Track your ingredients.{" "}
        <span className="text-emerald-500 mx-1"> Save More. </span> Share More.
      </Label>
      <div className="flex justify-center text-center flex-row gap-2">
        <Label className="flex mb-4 font-light text-lg text-slate-600">
          Over 1 in 10 people in Hamburg rely on food banks. Got extra ingredients? Share with your community
          or pick up what you need.
        </Label>
        <Link
          href="/donate"
          className="flex flex-row gap-1 text-slate-950 text-lg cursor-pointer"
        >
          <span className="underline decoration-slate-900">
            See local food banks.
          </span>
        </Link>
      </div>
      <div className="flex flex-row justify-center gap-2 mt-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant={"default"}
              size={"lg"}
              className="rounded-full py-6 px-12 cursor-pointer text-md"
            >
              Add Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Ingredient</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => {
                    const [inputValue, setInputValue] = useState(field.value);
                    const [popoverOpen, setPopoverOpen] = useState(false);

                    useEffect(() => {
                      setInputValue(field.value);
                    }, [field.value]);

                    const canAddCustom =
                      inputValue &&
                      !ingredientOptions.some(
                        (opt) => opt.toLowerCase() === inputValue.toLowerCase()
                      );

                    // Helper to handle selection and close/reset
                    const handleSelect = (value: string) => {
                      field.onChange(value);
                      setPopoverOpen(false);
                      setInputValue(""); // Reset input for next open
                    };

                    return (
                      <FormItem>
                        <FormLabel>Ingredient Name</FormLabel>
                        <FormControl>
                          <Popover
                            open={popoverOpen}
                            onOpenChange={setPopoverOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between"
                              >
                                {field.value
                                  ? ingredientOptions.find(
                                      (opt) => opt === field.value
                                    ) || field.value
                                  : "Select or type…"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Type or select ingredient…"
                                  value={inputValue}
                                  onValueChange={setInputValue}
                                />
                                <CommandList>
                                  <CommandEmpty className="p-2">
                                    {canAddCustom ? (
                                      <Button
                                        variant="ghost"
                                        className="w-full justify-start text-slate-400 font-light"
                                        onClick={() => handleSelect(inputValue)}
                                      >
                                        Click to Add:{" "}
                                        <span className="font-semibold ml-1 text-slate-700">
                                          {inputValue}
                                        </span>
                                      </Button>
                                    ) : (
                                      "No ingredient found."
                                    )}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {ingredientOptions
                                      .filter((opt) =>
                                        opt
                                          .toLowerCase()
                                          .includes(inputValue.toLowerCase())
                                      )
                                      .map((opt) => (
                                        <CommandItem
                                          key={opt}
                                          value={opt}
                                          onSelect={() => handleSelect(opt)}
                                        >
                                          {opt}
                                          <Check
                                            className={`ml-auto ${
                                              field.value === opt
                                                ? "opacity-100"
                                                : "opacity-0"
                                            }`}
                                          />
                                        </CommandItem>
                                      ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  name="quantity"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex gap-2">
                      <FormItem className="w-3/4">
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="e.g. 2"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      <FormField
                        name="unit"
                        control={form.control}
                        render={({ field: unitField }) => (
                          <FormItem className="w-1/4">
                            <FormLabel>Unit</FormLabel>
                            <FormControl>
                              <Select
                                value={unitField.value}
                                onValueChange={unitField.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  {COMMON_INGREDIENT_UNITS.map((unit) => (
                                    <SelectItem
                                      key={unit.value}
                                      value={unit.value}
                                    >
                                      {unit.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            {/* <FormMessage /> */}
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                />
                <FormField
                  name="expiry"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          min={new Date().toISOString().split("T")[0]} // Disable days before today
                          {...field}
                        />
                      </FormControl>
                      {/* <FormMessage /> */}
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid || loading}
                  >
                    {loading ? "Adding Ingredient..." : "Add Ingredient"}
                  </Button>
                </DialogFooter>
                {/* {formMessage && (
                  <div
                    className={`mt-2 text-sm ${
                      formMessage.includes("success")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formMessage}
                  </div>
                )} */}
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        <Button
          variant={"secondary"}
          className="border bg-white rounded-full py-6 px-12 cursor-pointer text-md"
          disabled
        >
          Scan Ingredient
        </Button>
      </div>
      {/* Ingredient Cards */}
      <div className="p-6 mt-8 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {ingredients
          .slice()
          .sort((a, b) => {
            const dateA = a.expiry ? new Date(a.expiry).getTime() : Infinity;
            const dateB = b.expiry ? new Date(b.expiry).getTime() : Infinity;
            return dateA - dateB;
          })
          .map((ingredient) => (
            <Card
              key={ingredient?.id || ingredient.name}
              className="shadow-xs border-0"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{ingredient.name}</CardTitle>
                <div className="flex flex-row space-y-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <EllipsisVertical className="w-4 h-4 cursor-pointer" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleEditClick(ingredient)}
                        className="cursor-pointer"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(ingredient)}
                        className="cursor-pointer text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {ingredient.quantity && ingredient.unit && (
                  <Label className="text-sm text-slate-500">
                    Quantity:{" "}
                    <span className="text-slate-950 font-semibold">
                      {ingredient.quantity} {ingredient.unit}
                    </span>
                  </Label>
                )}
                {ingredient.expiry && (
                  <div className="mt-1">
                    {(() => {
                      const today = new Date();
                      const expiryDate = new Date(ingredient.expiry);
                      const diffTime = expiryDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24)
                      );

                      let badgeColor = "text-green-500"; // Default green
                      if (diffDays < 0) {
                        badgeColor = "text-red-500";
                      } else if (diffDays <= 3) {
                        badgeColor = "text-yellow-500";
                      } else if (diffDays < 7) {
                        badgeColor = "text-orange-500";
                      }

                      const badgeText =
                        diffDays > 0
                          ? `Expires in ${diffDays} day${
                              diffDays > 1 ? "s" : ""
                            }`
                          : diffDays === 0
                          ? "Expires today"
                          : "Expired";

                      return (
                        <Label className={`text-xs rounded-full ${badgeColor}`}>
                          {badgeText}
                        </Label>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      {/* Edit Ingredient Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ingredient</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                name="name"
                control={editForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredient Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
              <FormField
                name="quantity"
                control={editForm.control}
                render={({ field }) => (
                  <div className="flex gap-2">
                    <FormItem className="w-3/4">
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="e.g. 2"
                          {...field}
                        />
                      </FormControl>
                      {/* <FormMessage /> */}
                    </FormItem>
                    <FormField
                      name="unit"
                      control={editForm.control}
                      render={({ field: unitField }) => (
                        <FormItem className="w-1/4">
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Select
                              value={unitField.value}
                              onValueChange={unitField.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                              <SelectContent>
                                {COMMON_INGREDIENT_UNITS.map((unit) => (
                                  <SelectItem
                                    key={unit.value}
                                    value={unit.value}
                                  >
                                    {unit.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          {/* <FormMessage /> */}
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              />
              <FormField
                name="expiry"
                control={editForm.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        {...field}
                      />
                    </FormControl>
                    {/* <FormMessage /> */}
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={!editForm.formState.isValid || editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
              {editMessage && (
                <div
                  className={`mt-2 text-sm ${
                    editMessage.includes("success")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {editMessage}
                </div>
              )}
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Ingredient Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ingredient</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete{" "}
            <span className="font-semibold">
              {deleteIngredient?.name} ({deleteIngredient?.quantity}
              {" "}{deleteIngredient?.unit})
            </span>
            ?
          </div>
          {deleteMessage && (
            <div
              className={`mt-2 text-sm ${
                deleteMessage.includes("success")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {deleteMessage}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
