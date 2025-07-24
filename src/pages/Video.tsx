import { useState, useRef } from "react";
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
  { id: 1, title: "Photosynthesis Explained", grade: "Grade 5", subject: "Science", curriculum: "CBC", url: "https://www.youtube.com/embed/UPBMG5EYydo" },
  { id: 2, title: "Solving Linear Equations", grade: "Grade 7", subject: "Mathematics", curriculum: "WAEC", url: "https://www.youtube.com/embed/2ybjYw1gO6A" },
  { id: 3, title: "The Water Cycle", grade: "Grade 4", subject: "Science", curriculum: "NECTA", url: "https://www.youtube.com/embed/IO9tT186mZw" },
];

const grades = [
  "All Grades", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Form 1", "Form 2", "Form 3", "Form 4"
];
const subjects = [
  "All Subjects", "Mathematics", "Science", "English", "Kiswahili", "Social Studies", "Physics", "Chemistry", "Biology", "Geography", "History", "Other"
];
const languages = [
  "English",
  "Swahili",
  "Hausa",
  "Kikuyu",
  "Kalenjin",
  "Somali",
  "Mijikenda"
];
const curriculumInfo: Record<string, { description: string; icon: string }> = {
  CBC: {
    description: "Kenya's Competency Based Curriculum (CBC) focuses on skills and competencies.",
    icon: "🇰🇪",
  },
  WAEC: {
    description: "West African Examinations Council (WAEC) curriculum for West Africa.",
    icon: "🌍",
  },
  NECTA: {
    description: "Tanzania's National Examinations Council (NECTA) curriculum.",
    icon: "🇹🇿",
  },
};
const curricula = ["All Curricula", ...Object.keys(curriculumInfo)];

export default function Video() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedGrade, setSelectedGrade] = useState("All Grades");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  // Default to 'All Curricula' for filtering
  const [selectedCurriculum, setSelectedCurriculum] = useState("All Curricula");
  const [liteMode, setLiteMode] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiVideoUrl, setAiVideoUrl] = useState<string | null>(null);
  const [aiVideoTitle, setAiVideoTitle] = useState<string>("");
  const [showCurriculumInfo, setShowCurriculumInfo] = useState(false);
  // Accessibility: high-contrast mode
  const [highContrast, setHighContrast] = useState(false);
  // Gamification: badges (scaffold)
  const [badges, setBadges] = useState<string[]>([]);
  // Accessibility: text-to-speech
  const ttsRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Add curriculum-specific filtering
  const filteredVideos = videoLibrary.filter(
    v => (selectedGrade === "All Grades" || v.grade === selectedGrade) &&
         (selectedSubject === "All Subjects" || v.subject === selectedSubject) &&
         (selectedCurriculum === "All Curricula" || v.curriculum === selectedCurriculum)
  );

  // Accessibility: text-to-speech for video descriptions
  const speak = (text: string) => {
    if (window.speechSynthesis) {
      if (ttsRef.current) window.speechSynthesis.cancel();
      const utter = new window.SpeechSynthesisUtterance(text);
      ttsRef.current = utter;
      window.speechSynthesis.speak(utter);
    }
  };

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
    <div className={
      `min-h-screen-mobile bg-gradient-to-br from-background to-accent ${highContrast ? 'contrast-150 bg-black text-yellow-200' : ''}`
    }>
      <div className="container mx-auto px-4 py-4 md:py-8 min-h-screen-safe flex flex-col max-w-4xl min-h-[calc(100vh-4rem)]">
        {/* Accessibility: High Contrast Toggle */}
        <div className="flex justify-end mb-2">
          <button
            className={`px-3 py-1 rounded text-xs font-semibold border ${highContrast ? 'bg-yellow-300 text-black' : 'bg-muted text-foreground'}`}
            onClick={() => setHighContrast(v => !v)}
            aria-label="Toggle high contrast mode"
          >
            {highContrast ? 'Normal Mode' : 'High Contrast'}
          </button>
        </div>
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
        <div className="flex flex-wrap gap-2 mt-2 items-end">
          <div>
            <Label htmlFor="video-language" className="text-xs">Language</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <Label htmlFor="video-curriculum" className="text-xs">Curriculum</Label>
              <button
                type="button"
                className="text-xs text-primary underline hover:no-underline focus:outline-none"
                onClick={() => setShowCurriculumInfo(v => !v)}
                aria-label="Show curriculum info"
              >
                ?
              </button>
            </div>
            <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue placeholder="Curriculum" />
              </SelectTrigger>
              <SelectContent>
                {curricula.map((cur) => (
                  <SelectItem key={cur} value={cur}>
                    <span className="mr-1">{curriculumInfo[cur].icon}</span>{cur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {showCurriculumInfo && (
              <div className="mt-1 p-2 rounded bg-muted text-xs shadow border w-56 z-20 absolute">
                <div className="font-semibold mb-1">{curriculumInfo[selectedCurriculum].icon} {selectedCurriculum}</div>
                <div>{curriculumInfo[selectedCurriculum].description}</div>
                <button
                  className="mt-2 text-primary underline text-xs"
                  onClick={() => setShowCurriculumInfo(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="video-lite-mode" checked={liteMode} onChange={() => setLiteMode(v => !v)} className="mr-1" title="Enable Lite Mode" />
            <Label htmlFor="video-lite-mode" className="text-xs">Lite Mode</Label>
          </div>
        </div>
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
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
                    <span>{curriculumInfo[selectedCurriculum].icon}</span> {selectedCurriculum}
                  </span>
                </div>
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
          <div className="space-y-2">
            <Label htmlFor="curriculum-filter" className="text-sm font-medium">Curriculum</Label>
            <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
              <SelectTrigger>
                <SelectValue placeholder="Select curriculum..." />
              </SelectTrigger>
              <SelectContent>
                {curricula.map((cur) => (
                  <SelectItem key={cur} value={cur}>
                    <span className="mr-1">{curriculumInfo[cur].icon}</span>{cur}
                  </SelectItem>
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
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
                  <span>{curriculumInfo[selectedCurriculum].icon}</span> {selectedCurriculum}
                </span>
                {/* Accessibility: Text-to-speech button for video title/desc */}
                <button
                  className="ml-2 px-2 py-1 rounded bg-muted text-xs border hover:bg-accent"
                  onClick={() => speak(`${video.title}. ${video.subject}, ${video.grade}, ${curriculumInfo[video.curriculum]?.description || ''}`)}
                  aria-label="Read video description aloud"
                >
                  🔊
                </button>
              </div>
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
