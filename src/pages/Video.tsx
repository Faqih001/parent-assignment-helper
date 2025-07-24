import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { geminiService } from "@/lib/gemini";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, PlayCircle } from "lucide-react";

// Dummy data for demonstration
const videoLibrary = [
  { id: 1, title: "Photosynthesis Explained", grade: "Grade 5", subject: "Science", url: "https://www.youtube.com/embed/UPBMG5EYydo" },
  { id: 2, title: "Solving Linear Equations", grade: "Grade 7", subject: "Mathematics", url: "https://www.youtube.com/embed/2ybjYw1gO6A" },
  { id: 3, title: "The Water Cycle", grade: "Grade 4", subject: "Science", url: "https://www.youtube.com/embed/IO9tT186mZw" },
];

const grades = [
  "All Grades", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Form 1", "Form 2", "Form 3", "Form 4"
];
const subjects = [
  "All Subjects", "Mathematics", "Science", "English", "Kiswahili", "Social Studies", "Physics", "Chemistry", "Biology", "Geography", "History", "Other"
];

export default function Video() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiVideoUrl, setAiVideoUrl] = useState<string | null>(null);
  const [aiVideoTitle, setAiVideoTitle] = useState<string>("");

  const filteredVideos = videoLibrary.filter(
    v => (selectedGrade === "All Grades" || v.grade === selectedGrade) &&
         (selectedSubject === "All Subjects" || v.subject === selectedSubject)
  );

  const handleGenerateVideo = async () => {
    if (!input.trim() || isLoading || !user) return;
    setIsLoading(true);
    setAiVideoUrl(null);
    setAiVideoTitle("");
    try {
      // Real API call to Gemini AI video generation backend
      const videoUrl = await geminiService.generateVideo({
        prompt: input,
        grade: selectedGrade,
        subject: selectedSubject
      });
      setAiVideoUrl(videoUrl);
      setAiVideoTitle(input);
      toast({ title: "Video Generated!", description: "Your AI video is ready to watch." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate video. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen-safe bg-gradient-to-br from-background to-accent flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <PlayCircle className="h-6 w-6" />
              <span>Login Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Please log in to access the AI video generator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen-mobile bg-gradient-to-br from-background to-accent">
      <div className="container mx-auto px-4 py-4 md:py-8 min-h-screen-safe flex flex-col max-w-4xl min-h-[calc(100vh-4rem)]">
        <div className="mb-4 md:mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <PlayCircle className="h-6 w-6 text-primary" />
              Video Library
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">Watch topic videos for better understanding or generate your own with AI</p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Video
          </Button>
        </div>

        {/* AI Video Generation Input */}
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-end gap-3 md:gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="ai-video-input" className="text-sm font-medium">Describe the topic you want an AI video for</Label>
                <textarea
                  id="ai-video-input"
                  placeholder="e.g. Explain photosynthesis for Grade 5"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  className="min-h-[60px] md:min-h-[80px] max-h-32 resize-none w-full border rounded-md p-2 text-sm"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleGenerateVideo}
                disabled={!input.trim() || isLoading}
                className="px-6 md:px-8 h-12 md:h-14"
                size="default"
              >
                {isLoading ? "Generating..." : "Generate Video"}
              </Button>
            </div>
            {aiVideoUrl && (
              <div className="mt-6">
                <h3 className="text-base font-semibold mb-2">AI Generated Video: {aiVideoTitle}</h3>
                <div className="aspect-video rounded-lg overflow-hidden mb-2">
                  <iframe
                    src={aiVideoUrl}
                    title={aiVideoTitle}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  ></iframe>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="mb-4 md:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="space-y-2">
            <Label htmlFor="grade" className="text-sm font-medium">Grade/Form</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Select grade..." />
              </SelectTrigger>
              <SelectContent>
                {grades.map((gr) => (
                  <SelectItem key={gr} value={gr}>{gr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject..." />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVideos.length === 0 ? (
            <div className="col-span-2 text-center text-muted-foreground py-8">No videos found for the selected filters.</div>
          ) : (
            filteredVideos.map(video => (
              <Card key={video.id} className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">{video.title}</CardTitle>
                  <div className="text-xs text-muted-foreground">{video.subject} | {video.grade}</div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden mb-2">
                    <iframe
                      src={video.url}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
