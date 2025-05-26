"use client"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#161038]">
      <img src="/circles-logo-cropped.png" alt="circles logo" className="max-h-80 w-auto mb-4" />
      <h1 className="text-5xl font-bold text-white mb-4 tracking-wide lowercase">circles</h1>
      <p className="text-xl text-gray-300 max-w-xl text-center mb-8">
        <span className="font-semibold text-white">Problem:</span> Staying accountable and productive in teams is hard—goals get lost, feedback is vague, and progress is invisible.<br /><br />
        <span className="font-semibold text-white">Solution:</span> Circles makes team accountability effortless. Set daily goals, track progress, and get clear, supportive feedback—so everyone grows, together.
      </p>
    </div>
  )
}
