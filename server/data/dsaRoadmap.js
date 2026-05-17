const topicProblems = {
  Arrays: ['Two Sum', 'Best Time to Buy and Sell Stock', 'Maximum Subarray', 'Contains Duplicate', 'Product of Array Except Self', 'Merge Intervals', 'Rotate Array', 'Set Matrix Zeroes', 'Spiral Matrix', 'Longest Consecutive Sequence'],
  Strings: ['Valid Anagram', 'Longest Common Prefix', 'Group Anagrams', 'Longest Palindromic Substring', 'Encode and Decode Strings', 'String Compression', 'Roman to Integer', 'Find the Index of First Occurrence', 'Repeated Substring Pattern', 'Isomorphic Strings'],
  'Two Pointers': ['Valid Palindrome', 'Two Sum II', '3Sum', 'Container With Most Water', 'Trapping Rain Water', 'Move Zeroes', 'Squares of a Sorted Array', 'Boats to Save People', 'Backspace String Compare', 'Remove Duplicates from Sorted Array'],
  'Sliding Window': ['Best Time to Buy and Sell Stock', 'Longest Substring Without Repeating Characters', 'Longest Repeating Character Replacement', 'Permutation in String', 'Minimum Window Substring', 'Find All Anagrams in a String', 'Maximum Average Subarray I', 'Fruit Into Baskets', 'Subarray Product Less Than K', 'Minimum Size Subarray Sum'],
  HashMap: ['Two Sum', 'Contains Duplicate', 'Valid Sudoku', 'Top K Frequent Elements', 'Ransom Note', 'Happy Number', 'Word Pattern', 'Intersection of Two Arrays', 'Subarray Sum Equals K', 'Longest Consecutive Sequence'],
  Stack: ['Valid Parentheses', 'Min Stack', 'Evaluate Reverse Polish Notation', 'Daily Temperatures', 'Car Fleet', 'Largest Rectangle in Histogram', 'Decode String', 'Asteroid Collision', 'Simplify Path', 'Next Greater Element I'],
  Queue: ['Implement Queue using Stacks', 'Number of Recent Calls', 'Moving Average from Data Stream', 'Design Circular Queue', 'Dota2 Senate', 'Rotting Oranges', 'Open the Lock', 'Perfect Squares', 'Sliding Window Maximum', 'First Unique Character in a String'],
  'Binary Search': ['Binary Search', 'Search Insert Position', 'Guess Number Higher or Lower', 'First Bad Version', 'Search in Rotated Sorted Array', 'Find Minimum in Rotated Sorted Array', 'Koko Eating Bananas', 'Capacity To Ship Packages Within D Days', 'Median of Two Sorted Arrays', 'Time Based Key-Value Store'],
  'Linked List': ['Reverse Linked List', 'Merge Two Sorted Lists', 'Linked List Cycle', 'Reorder List', 'Remove Nth Node From End of List', 'Copy List with Random Pointer', 'Add Two Numbers', 'Find the Duplicate Number', 'LRU Cache', 'Swap Nodes in Pairs'],
  Recursion: ['Fibonacci Number', 'Power of Three', 'Reverse String', 'Merge Two Sorted Lists', 'Pow(x, n)', 'K-th Symbol in Grammar', 'Climbing Stairs', 'Maximum Depth of Binary Tree', 'Same Tree', 'Different Ways to Add Parentheses'],
  Backtracking: ['Subsets', 'Combination Sum', 'Permutations', 'Subsets II', 'Combination Sum II', 'Word Search', 'Palindrome Partitioning', 'Letter Combinations of a Phone Number', 'N-Queens', 'Generate Parentheses'],
  Tree: ['Maximum Depth of Binary Tree', 'Same Tree', 'Invert Binary Tree', 'Binary Tree Level Order Traversal', 'Diameter of Binary Tree', 'Balanced Binary Tree', 'Subtree of Another Tree', 'Lowest Common Ancestor of a Binary Tree', 'Binary Tree Right Side View', 'Count Good Nodes in Binary Tree'],
  'Binary Search Tree': ['Validate Binary Search Tree', 'Kth Smallest Element in a BST', 'Lowest Common Ancestor of a BST', 'Insert into a Binary Search Tree', 'Delete Node in a BST', 'Convert Sorted Array to BST', 'Range Sum of BST', 'Two Sum IV', 'Search in a BST', 'Minimum Absolute Difference in BST'],
  'Heap / Priority Queue': ['Kth Largest Element in a Stream', 'Last Stone Weight', 'K Closest Points to Origin', 'Kth Largest Element in an Array', 'Task Scheduler', 'Design Twitter', 'Find Median from Data Stream', 'Top K Frequent Words', 'Reorganize String', 'Merge K Sorted Lists'],
  Graph: ['Number of Islands', 'Clone Graph', 'Max Area of Island', 'Pacific Atlantic Water Flow', 'Surrounded Regions', 'Course Schedule', 'Course Schedule II', 'Redundant Connection', 'Word Ladder', 'Network Delay Time'],
  BFS: ['Binary Tree Level Order Traversal', 'Rotting Oranges', 'Open the Lock', 'Word Ladder', 'Minimum Depth of Binary Tree', '01 Matrix', 'Perfect Squares', 'Bus Routes', 'Shortest Path in Binary Matrix', 'Walls and Gates'],
  DFS: ['Number of Islands', 'Max Area of Island', 'Flood Fill', 'Path Sum', 'Clone Graph', 'Pacific Atlantic Water Flow', 'Surrounded Regions', 'Course Schedule', 'Word Search', 'Evaluate Division'],
  Greedy: ['Maximum Subarray', 'Jump Game', 'Jump Game II', 'Gas Station', 'Hand of Straights', 'Merge Triplets to Form Target Triplet', 'Partition Labels', 'Valid Parenthesis String', 'Candy', 'Queue Reconstruction by Height'],
  'Dynamic Programming': ['Climbing Stairs', 'House Robber', 'House Robber II', 'Longest Palindromic Substring', 'Palindromic Substrings', 'Decode Ways', 'Coin Change', 'Maximum Product Subarray', 'Word Break', 'Longest Increasing Subsequence'],
  'Bit Manipulation': ['Single Number', 'Number of 1 Bits', 'Counting Bits', 'Reverse Bits', 'Missing Number', 'Sum of Two Integers', 'Bitwise AND of Numbers Range', 'Subsets', 'Power of Two', 'Add Binary'],
};

const patternByTopic = {
  Arrays: 'Iteration',
  Strings: 'Frequency / parsing',
  'Two Pointers': 'Two pointers',
  'Sliding Window': 'Sliding window',
  HashMap: 'Hash lookup',
  Stack: 'Monotonic / explicit stack',
  Queue: 'Queue traversal',
  'Binary Search': 'Binary search',
  'Linked List': 'Pointer manipulation',
  Recursion: 'Recursive decomposition',
  Backtracking: 'Decision tree',
  Tree: 'Tree traversal',
  'Binary Search Tree': 'BST property',
  'Heap / Priority Queue': 'Heap',
  Graph: 'Graph traversal',
  BFS: 'Breadth-first search',
  DFS: 'Depth-first search',
  Greedy: 'Greedy choice',
  'Dynamic Programming': 'State transition',
  'Bit Manipulation': 'Bit tricks',
};

const levelForIndex = (index) => index < 4 ? 'Beginner' : index < 8 ? 'Intermediate' : 'Advanced';
const difficultyForIndex = (index) => index < 4 ? 'Easy' : index < 8 ? 'Medium' : 'Hard';
const slugify = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const roadmap = Object.entries(topicProblems).flatMap(([topic, titles]) =>
  titles.map((title, index) => ({
    id: `${slugify(topic)}-${index + 1}`,
    title,
    difficulty: difficultyForIndex(index),
    level: levelForIndex(index),
    topic,
    pattern: patternByTopic[topic],
    leetCodeLink: `https://leetcode.com/problems/${slugify(title)}/`,
    whyImportant: `Builds confidence with ${patternByTopic[topic].toLowerCase()} problems.`,
    prerequisiteConcept: patternByTopic[topic],
    status: 'Not Started',
  }))
);

module.exports = roadmap;
