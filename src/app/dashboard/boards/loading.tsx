"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function BoardsLoading() {
  // Create an array of 8 skeleton items
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <motion.div 
            className="h-8 w-48 rounded-md bg-muted"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          />
          <motion.div 
            className="h-5 w-64 rounded-md bg-muted"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.1 }}
          />
        </div>
        <motion.div 
          className="h-10 w-32 rounded-md bg-muted"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.2 }}
        />
      </div>

      {/* Filter skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <motion.div 
          className="h-10 w-64 rounded-md bg-muted"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.3 }}
        />
        <div className="flex items-center gap-2">
          <motion.div 
            className="h-10 w-24 rounded-md bg-muted"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.4 }}
          />
          <motion.div 
            className="h-10 w-24 rounded-md bg-muted"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.5 }}
          />
        </div>
      </div>

      {/* Boards grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {skeletonItems.map((index) => (
          <Card key={index} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="h-8 w-8 rounded-md bg-muted"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5, 
                      repeatType: "reverse",
                      delay: (index * 0.05) % 0.5
                    }}
                  />
                  <motion.div 
                    className="h-6 w-24 rounded-md bg-muted"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5, 
                      repeatType: "reverse",
                      delay: (index * 0.05) % 0.5 + 0.1
                    }}
                  />
                </div>
                <motion.div 
                  className="h-8 w-8 rounded-md bg-muted"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    repeatType: "reverse",
                    delay: (index * 0.05) % 0.5 + 0.2
                  }}
                />
              </div>
              <div className="mt-4 space-y-2">
                <motion.div 
                  className="h-6 w-full rounded-md bg-muted"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    repeatType: "reverse",
                    delay: (index * 0.05) % 0.5 + 0.3
                  }}
                />
                <motion.div 
                  className="h-4 w-3/4 rounded-md bg-muted"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    repeatType: "reverse",
                    delay: (index * 0.05) % 0.5 + 0.4
                  }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between border-t p-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="h-5 w-16 rounded-md bg-muted"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    repeatType: "reverse",
                    delay: (index * 0.05) % 0.5 + 0.5
                  }}
                />
                <motion.div 
                  className="h-5 w-16 rounded-md bg-muted"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    repeatType: "reverse",
                    delay: (index * 0.05) % 0.5 + 0.6
                  }}
                />
              </div>
              <motion.div 
                className="h-8 w-8 rounded-full bg-muted"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5, 
                  repeatType: "reverse",
                  delay: (index * 0.05) % 0.5 + 0.7
                }}
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 