import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ForumPost {
  id: string;
  author: string;
  content: string;
  replies: ForumPost[];
}

export default function ForumPage() {
  // Placeholder state for posts
  const [posts, setPosts] = useState<ForumPost[]>([
    {
      id: "1",
      author: "Jane Doe",
      content: "How do you help your child stay motivated with homework?",
      replies: [
        {
          id: "1-1",
          author: "Parent123",
          content: "We use a reward chart and lots of encouragement!",
          replies: [],
        },
      ],
    },
  ]);
  const [newPost, setNewPost] = useState("");

  // Placeholder for posting logic
  const handlePost = () => {
    if (!newPost.trim()) return;
    setPosts([
      ...posts,
      {
        id: Date.now().toString(),
        author: "You",
        content: newPost,
        replies: [],
      },
    ]);
    setNewPost("");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Community Forum</h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Start a Discussion</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="Share a question, tip, or experience..."
            rows={3}
          />
          <Button className="mt-2" onClick={handlePost}>Post</Button>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {posts.map(post => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle className="text-base">{post.author}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{post.content}</p>
              {/* Replies and reply form placeholder */}
              {post.replies.length > 0 && (
                <div className="mt-4 ml-4 border-l pl-4">
                  <div className="font-semibold text-xs mb-1">Replies:</div>
                  {post.replies.map(reply => (
                    <div key={reply.id} className="mb-2">
                      <span className="font-medium">{reply.author}:</span> {reply.content}
                    </div>
                  ))}
                </div>
              )}
              {/* TODO: Add reply form and moderation tools */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
