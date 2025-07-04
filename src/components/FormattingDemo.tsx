import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FormattedMessage from "@/components/FormattedMessage";

const sampleResponses = {
  math: `Great question! Let me help you solve this **step by step**.

**Understanding the Problem:**
We need to solve the equation: 2x + 5 = 15

Step 1: Identify what we're solving for
We want to find the value of x that makes this equation true.

Step 2: Subtract 5 from both sides
2x + 5 - 5 = 15 - 5
2x = 10

Step 3: Divide both sides by 2
2x ÷ 2 = 10 ÷ 2
x = 5

**Answer:** x = 5

**Let's verify our answer:**
Substitute x = 5 back into the original equation:
2(5) + 5 = 10 + 5 = 15 ✓

**Note:** Remember, whatever operation you do to one side of an equation, you must do to the other side to keep it balanced!

**Example:** Try solving 3x - 4 = 8 using the same method. You should get x = 4.`,

  science: `Excellent question about **photosynthesis**! Let me explain this important process in a way that's easy to understand.

**What is Photosynthesis?**
Photosynthesis is the process where plants make their own food using sunlight, water, and carbon dioxide.

**The Simple Equation:**
Carbon Dioxide + Water + Sunlight → Glucose + Oxygen
6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂

**Step 1: Light Absorption**
Plants capture sunlight using chlorophyll (the green substance in leaves).

**Step 2: Water Uptake**
Roots absorb water from the soil and transport it to the leaves.

**Step 3: Carbon Dioxide Entry**
CO₂ enters the leaves through tiny pores called stomata.

**Step 4: Food Production**
The plant combines these ingredients to make glucose (sugar) for energy.

**Step 5: Oxygen Release**
As a bonus, oxygen is released into the air for us to breathe!

**What plants need for photosynthesis:**
• Sunlight (provides energy)
• Carbon dioxide (from the air)
• Water (from the soil)
• Chlorophyll (green pigment in leaves)

**Example:** Think of a mango tree in your compound. It uses sunlight, water from the ground, and CO₂ from the air to make the sweet mangoes we love to eat!

**Remember:** Without photosynthesis, there would be no food or oxygen on Earth. Plants are truly amazing!

**Important:** This process only happens during the day when there's sunlight. At night, plants stop making food.`,

  english: `Great question about **essay writing**! Let me guide you through creating a strong essay structure.

**Basic Essay Structure:**

**1. Introduction Paragraph**
▪ Hook: Start with an interesting fact or question
▪ Background: Give context about your topic
▪ Thesis statement: Your main argument or point

**2. Body Paragraphs (usually 2-3)**
▪ Topic sentence: Main idea of the paragraph
▪ Evidence: Facts, examples, or quotes
▪ Explanation: How the evidence supports your point
▪ Concluding sentence: Link to the next paragraph

**3. Conclusion Paragraph**
▪ Restate your thesis in different words
▪ Summarize your main points
▪ End with a memorable final thought

**Types of Essays:**
a) Narrative essays - tell a story
b) Descriptive essays - paint a picture with words
c) Expository essays - explain or inform
d) Persuasive essays - convince the reader

**Essay Writing Process:**
i. Brainstorm ideas
ii. Create an outline
iii. Write the first draft
iv. Revise and edit
v. Final proofreading

**Example:** For an essay about "Why Education is Important":

**Introduction:** "Did you know that education can change a person's entire life? In Kenya, education opens doors to better opportunities..."

**Body Paragraph 1:** "First, education provides better job opportunities..."

**Body Paragraph 2:** "Second, education helps people make informed decisions..."

**Conclusion:** "In conclusion, education is the key to personal and national development..."

**Remember:** Each paragraph should focus on ONE main idea, and all paragraphs should connect to support your thesis.

**Note:** Always proofread your essay for spelling and grammar mistakes before submitting!`,

  formatting: `Here's a comprehensive **formatting demonstration** showing all the different list types and bullet styles supported!

**Different List Types:**

**1. Numbered Lists (1, 2, 3):**
1. First numbered item with blue circle
2. Second numbered item 
3. Third numbered item

**2. Letter Lists (a, b, c):**
a) First letter item with purple circle
b) Second letter item
c) Third letter item

**3. Roman Numeral Lists (i, ii, iii):**
i. First roman numeral with indigo badge
ii. Second roman numeral 
iii. Third roman numeral

**4. Bullet Points with Different Symbols:**

**Standard bullets:**
• Primary bullet point
• Secondary bullet point
• Another bullet point

**Alternative bullets:**
- Dash bullet point
* Star bullet point
▪ Square bullet point
▫ Hollow square bullet point
◦ Circle bullet point

**5. Mixed Content Example:**
Here's some regular text followed by a list:

• Important concept one
• Important concept two
• Important concept three

And then more regular text explaining the concepts.

**Step-by-Step Process:**
Step 1: This will show in a blue step box
Step 2: Each step gets its own numbered badge
Step 3: Perfect for procedures and tutorials

**Note:** All these formatting options work together to create engaging, educational content!

**Answer:** This demonstrates the full range of formatting capabilities available in the chat responses.`
};

export function FormattingDemo() {
  const [selectedResponse, setSelectedResponse] = useState<keyof typeof sampleResponses>('formatting');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>📝 Enhanced Chat Response Formatting Demo</CardTitle>
          <p className="text-muted-foreground">
            See how different types of educational content, bullet points, and numbering are formatted in the chat
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              variant={selectedResponse === 'formatting' ? 'default' : 'outline'}
              onClick={() => setSelectedResponse('formatting')}
            >
              All Formatting Types
            </Button>
            <Button 
              variant={selectedResponse === 'math' ? 'default' : 'outline'}
              onClick={() => setSelectedResponse('math')}
            >
              Math Problem
            </Button>
            <Button 
              variant={selectedResponse === 'science' ? 'default' : 'outline'}
              onClick={() => setSelectedResponse('science')}
            >
              Science Concept
            </Button>
            <Button 
              variant={selectedResponse === 'english' ? 'default' : 'outline'}
              onClick={() => setSelectedResponse('english')}
            >
              Essay Writing
            </Button>
          </div>
          
          <Card className="shadow-soft bg-card">
            <CardContent className="p-5 md:p-6">
              <FormattedMessage 
                content={sampleResponses[selectedResponse]} 
                className="text-card-foreground"
              />
              <div className="text-xs mt-3 text-muted-foreground">
                {new Date().toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
