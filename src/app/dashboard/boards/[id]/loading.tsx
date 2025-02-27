"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

export default function BoardDetailLoading() {
  // Create arrays for skeleton lists and cards
  const skeletonLists = Array.from({ length: 4 }, (_, i) => i);
  const skeletonCards = Array.from({ length: 3 }, (_, i) => i);

  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <motion.div 
            className="h-8 w-8 rounded-md bg-muted"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
          />
          <motion.div 
            className="h-6 w-24 rounded-md bg-muted"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.1 }}
          />
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <motion.div 
              className="h-9 w-64 rounded-md bg-muted mb-2"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.2 }}
            />
            <motion.div 
              className="h-5 w-full max-w-md rounded-md bg-muted"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.3 }}
            />
          </div>
          <div className="flex items-center gap-2">
            <motion.div 
              className="h-9 w-24 rounded-md bg-muted"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.4 }}
            />
            <motion.div 
              className="h-9 w-24 rounded-md bg-muted"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.5 }}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between border-b pb-4">
          <motion.div 
            className="h-6 w-48 rounded-md bg-muted"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.6 }}
          />
          <motion.div 
            className="h-8 w-24 rounded-md bg-muted"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.7 }}
          />
        </div>
      </div>

      {/* Board view controls skeleton */}
      <div className="flex items-center justify-between">
        <motion.div 
          className="h-10 w-48 rounded-md bg-muted"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.8 }}
        />
        <div className="flex items-center gap-2">
          <motion.div 
            className="h-9 w-24 rounded-md bg-muted"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 0.9 }}
          />
          <motion.div 
            className="h-9 w-20 rounded-md bg-muted"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 1.0 }}
          />
          <motion.div 
            className="h-9 w-20 rounded-md bg-muted"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: 1.1 }}
          />
        </div>
      </div>

      {/* Lists and cards skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {skeletonLists.map((listIndex) => (
          <div key={listIndex} className="flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div 
                  className="h-6 w-24 rounded-md bg-muted"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    repeatType: "reverse",
                    delay: (listIndex * 0.1 % 0.4)
                  }}
                />
                <motion.div 
                  className="h-5 w-6 rounded-full bg-muted"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5, 
                    repeatType: "reverse",
                    delay: (listIndex * 0.1 % 0.4) + 0.1
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
                  delay: (listIndex * 0.1 % 0.4) + 0.2
                }}
              />
            </div>
            
            <div className="space-y-3">
              {skeletonCards.map((cardIndex) => (
                <Card key={cardIndex} className="overflow-hidden">
                  <div className="p-3">
                    <div className="flex flex-row items-start justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <motion.div 
                            className="h-2 w-2 rounded-full bg-muted"
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 1.5, 
                              repeatType: "reverse",
                              delay: (listIndex * 0.1 + cardIndex * 0.1) % 0.6
                            }}
                          />
                          <motion.div 
                            className="h-4 w-16 rounded-md bg-muted"
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 1.5, 
                              repeatType: "reverse",
                              delay: (listIndex * 0.1 + cardIndex * 0.1) % 0.6 + 0.1
                            }}
                          />
                        </div>
                        <motion.div 
                          className="h-5 w-32 rounded-md bg-muted"
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 1 }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.5, 
                            repeatType: "reverse",
                            delay: (listIndex * 0.1 + cardIndex * 0.1) % 0.6 + 0.2
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
                          delay: (listIndex * 0.1 + cardIndex * 0.1) % 0.6 + 0.3
                        }}
                      />
                    </div>
                  </div>
                  <div className="px-3 pb-2 pt-0">
                    <motion.div 
                      className="h-4 w-full rounded-md bg-muted"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5, 
                        repeatType: "reverse",
                        delay: (listIndex * 0.1 + cardIndex * 0.1) % 0.6 + 0.4
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between border-t p-3 pt-2">
                    <motion.div 
                      className="h-4 w-12 rounded-md bg-muted"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5, 
                        repeatType: "reverse",
                        delay: (listIndex * 0.1 + cardIndex * 0.1) % 0.6 + 0.5
                      }}
                    />
                    <motion.div 
                      className="h-6 w-6 rounded-full bg-muted"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: 1 }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.5, 
                        repeatType: "reverse",
                        delay: (listIndex * 0.1 + cardIndex * 0.1) % 0.6 + 0.6
                      }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 