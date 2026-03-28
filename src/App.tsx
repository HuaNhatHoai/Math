/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { Copy, FileText, Loader2, Send, Sparkles, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef } from "react";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [latexResult, setLatexResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const resultRef = useRef<HTMLPreElement>(null);

  const generateLatex = async () => {
    if (!problem.trim() || !solution.trim()) return;

    setIsLoading(true);
    setLatexResult("");

    try {
      const prompt = `
Bạn là một chuyên gia soạn thảo LaTeX cho các bài toán toán học chuyên nghiệp.
Nhiệm vụ của bạn là chuyển đổi đề bài và lời giải được cung cấp thành một cấu trúc LaTeX chuẩn như sau:

\\subsubsection*{1. Hướng suy luận và Định hướng giải quyết}
[Phần phân tích hướng giải, tư duy, khai thác giả thiết một cách sâu sắc]

\\subsubsection*{2. Lời giải chi tiết}
\\loigiai{
Trong phần này, hãy chia lời giải thành các bước logic rõ ràng. 
Mỗi bước quan trọng PHẢI có một tiêu đề sử dụng cấu trúc: \\subsubsection*{Bước X: [Tên tiêu đề phản ánh nội dung và mục tiêu của bước]}
[Nội dung chi tiết của bước đó]
}

\\subsubsection*{3. Kiến thức trọng tâm}
\\begin{tcolorbox}[colback=orange!5!white,colframe=orange!75!black,title=Keywords]
\\begin{itemize}
    \\item \\textbf{[Tên kiến thức]:} [Mô tả ngắn gọn, súc tích]
\\end{itemize}
\\end{tcolorbox}

\\subsubsection*{4. Sơ đồ Workflow giải bài toán}
[Sử dụng gói TikZ để vẽ một sơ đồ (flowchart) thể hiện các bước giải bài toán một cách trực quan. Đảm bảo mã TikZ gọn gàng và có thể biên dịch được.]

Yêu cầu quan trọng:
- Sử dụng tiếng Việt chuẩn xác, văn phong sư phạm.
- Đảm bảo các công thức toán học được đặt trong dấu $...$ hoặc \\[...\\].
- TẤT CẢ các công thức toán học (kể cả công thức trong dòng) PHẢI sử dụng lệnh \\displaystyle để hiển thị đẹp nhất (ví dụ: $\\displaystyle ...$).
- Màu sắc của tcolorbox là tông Orange (Cam).
- Chỉ trả về mã LaTeX, không kèm theo giải thích gì thêm.

Đề bài:
${problem}

Lời giải:
${solution}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text = response.text || "";
      // Clean up markdown code blocks if any
      const cleanedText = text.replace(/```latex/g, "").replace(/```/g, "").trim();
      setLatexResult(cleanedText);
    } catch (error) {
      console.error("Error generating LaTeX:", error);
      setLatexResult("Đã xảy ra lỗi khi tạo mã LaTeX. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!latexResult) return;
    navigator.clipboard.writeText(latexResult);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const clearAll = () => {
    setProblem("");
    setSolution("");
    setLatexResult("");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-2 rounded-lg shadow-sm">
              <FileText className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              LaTeX Math Formatter
            </h1>
          </div>
          <button
            onClick={clearAll}
            className="text-slate-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
            title="Xóa tất cả"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-orange-500 w-5 h-5" />
                <h2 className="font-semibold text-slate-700">Nhập dữ liệu</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Đề bài
                  </label>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder="Nhập đề bài toán học tại đây..."
                    className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    Lời giải
                  </label>
                  <textarea
                    value={solution}
                    onChange={(e) => setSolution(e.target.value)}
                    placeholder="Nhập lời giải chi tiết tại đây..."
                    className="w-full h-64 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none bg-slate-50"
                  />
                </div>

                <button
                  onClick={generateLatex}
                  disabled={isLoading || !problem.trim() || !solution.trim()}
                  className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Tạo mã LaTeX
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="text-orange-500 w-5 h-5" />
                  <h2 className="font-semibold text-slate-700">Kết quả LaTeX</h2>
                </div>
                {latexResult && (
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copySuccess ? "Đã chép!" : (
                      <>
                        <Copy className="w-4 h-4" />
                        Sao chép
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex-grow bg-slate-900 rounded-xl overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {!latexResult && !isLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-8 text-center"
                    >
                      <div className="bg-slate-800 p-4 rounded-full mb-4">
                        <FileText className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-sm">Kết quả sẽ hiển thị tại đây sau khi bạn nhấn nút "Tạo mã LaTeX"</p>
                    </motion.div>
                  ) : (
                    <motion.pre
                      key={latexResult}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      ref={resultRef}
                      className="p-6 text-slate-300 font-mono text-sm overflow-auto h-full leading-relaxed whitespace-pre-wrap"
                    >
                      {latexResult || (isLoading && "Đang phân tích và định dạng...")}
                    </motion.pre>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-12 text-center text-slate-400 text-sm">
        <p>© 2026 LaTeX Math Formatter • Hỗ trợ bởi Gemini AI</p>
      </footer>
    </div>
  );
}
