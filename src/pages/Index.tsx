import React from "react";

const Index = () => {
  console.log("Minimal Index component rendering");
  
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">
          LangGraph Chat Interface - Debug Mode
        </h1>
        <p className="text-muted-foreground mb-4">
          If you can see this, React is working correctly.
        </p>
        <div className="p-4 border rounded-lg bg-card">
          <p>Current time: {new Date().toLocaleString()}</p>
          <button 
            onClick={() => {
              console.log("Button clicked successfully");
              alert("JavaScript is working!");
            }}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Test JavaScript
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
