"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import {
  getAdminCollections,
  updateCollection,
  deleteCollection,
} from "@/app/actions/admin";

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    const { collections: c, count } = await getAdminCollections(1, 50);
    setCollections(c);
    setTotalCount(count);
    setLoading(false);
  };

  const handleEdit = (collection: any) => {
    setEditing(collection.id);
    setEditData(collection);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    await updateCollection(editing, {
      name: editData.name,
      description: editData.description,
      type: editData.type,
      is_active: editData.is_active,
    });
    setEditing(null);
    loadCollections();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection?")) return;
    await deleteCollection(id);
    loadCollections();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Collections</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {totalCount} collections
          </p>
        </div>
        <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2.5 rounded-md text-sm font-semibold hover:bg-foreground/90 transition-all">
          <Plus size={16} /> New Collection
        </button>
      </div>

      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : collections.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No collections found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {collections.map((col) => (
                  <tr
                    key={col.id}
                    className="hover:bg-secondary/20 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-foreground">
                        {col.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {col.slug}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium text-muted-foreground capitalize">
                        {col.type}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "text-xs font-semibold px-2.5 py-1 rounded-full",
                          col.is_active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600",
                        )}
                      >
                        {col.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-muted-foreground">
                        {col.is_featured ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(col.created_at, {
                        year: undefined,
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(col)}
                          className="text-xs font-semibold text-accent hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(col.id)}
                          className="text-xs font-semibold text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && editData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-xl p-6 max-w-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Edit Collection
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Name
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Type
                </label>
                <select
                  value={editData.type}
                  onChange={(e) =>
                    setEditData({ ...editData, type: e.target.value })
                  }
                  className="input-field mt-1"
                >
                  <option value="seasonal">Seasonal</option>
                  <option value="curated">Curated</option>
                  <option value="sale">Sale</option>
                  <option value="new_arrival">New Arrival</option>
                  <option value="limited">Limited</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editData.is_active}
                  onChange={(e) =>
                    setEditData({ ...editData, is_active: e.target.checked })
                  }
                />
                <label
                  htmlFor="is_active"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Active
                </label>
              </div>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-3 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:bg-foreground/90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
