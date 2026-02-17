"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  // Check user session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch bookmarks and subscribe to real-time changes
  useEffect(() => {
    if (!user) return;

    // 1. Fetch initial bookmarks
    const fetchBookmarks = async () => {
      const { data } = await supabase
        .from("bookmarks")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setBookmarks(data);
    };
    fetchBookmarks();

    // 2. Setup Real-time listener
    const channel = supabase
      .channel("realtime bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookmarks((prev) => [payload.new, ...prev]);
          }
          if (payload.eventType === "DELETE") {
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Handle Login / Logout
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Add Bookmark
  const addBookmark = async (e) => {
    e.preventDefault();
    if (!title || !url) return;

    setIsAdding(true); // 1. Start the loader

    // Ensure URL has http/https
    const validUrl = url.startsWith("http") ? url : `https://${url}`;

    const { error } = await supabase
      .from("bookmarks")
      .insert([{ title, url: validUrl, user_id: user.id }]);

    if (!error) {
      setTitle("");
      setUrl("");
    } else {
      alert("Error adding bookmark");
    }

    setIsAdding(false); // 2. Stop the loader when finished
  };

  // Delete Bookmark
  const deleteBookmark = async (id) => {
    await supabase.from("bookmarks").delete().match({ id });
  };

  // --- UI RENDERING ---

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white shadow-md rounded-lg">
          <h1 className="text-2xl font-bold mb-4">Smart Bookmark App</h1>
          <button
            onClick={signInWithGoogle}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-2">
      <div className=" flex flex-row justify-between">
        <div className="mx-2 text-center">
          <h1 className="text-3xl font-bold">My Bookmarks</h1>
        </div>
        <div className="mx-2">
          <button
            onClick={signOut}
            className="text-white hover:text-black bg-black hover:bg-white p-2 rounded-lg border  "
          >
            Logout
          </button>
        </div>
      </div>
      <div className=" max-w-max mx-2">
        <form onSubmit={addBookmark} className="mb-8 flex gap-2">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 rounded flex-1 text-black"
            required
          />
          <input
            type="text"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="border p-2 rounded flex-1 text-black"
            required
          />
          <button
            type="submit"
            disabled={isAdding}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[100px]"
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
        </form>

        {/* Bookmark List */}
        <ul className="space-y-3">
          {bookmarks.length === 0 && (
            <p className="text-gray-500 text-bold text-lg">No bookmarks yet.</p>
          )}
          {bookmarks.map((bookmark) => (
            <li
              key={bookmark.id}
              className="flex justify-between items-center p-4 bg-gray-50 border rounded-lg hover:shadow-sm transition"
            >
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline"
              >
                {bookmark.title}
              </a>
              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="text-red-500 hover:text-red-700 text-sm font-semibold"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
