// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function main() {
  const templateCode = [
    {
      "language": "C",
      "title": "Hello World",
      "code": "#include <stdio.h>\nint main() { printf(\"Hello, World!\\n\"); return 0; }"
    },
    {
      "language": "C",
      "title": "Sum of Two Numbers",
      "code": "#include <stdio.h>\nint main() { int a = 5, b = 10; printf(\"%d\\n\", a + b); return 0; }"
    },
    {
      "language": "C",
      "title": "Factorial Calculation",
      "code": "int factorial(int n) { return n == 0 ? 1 : n * factorial(n - 1); }"
    },
    {
      "language": "C",
      "title": "Check Even or Odd",
      "code": "#include <stdio.h>\nint main() { int n = 4; printf(\"%s\\n\", n % 2 == 0 ? \"Even\" : \"Odd\"); return 0; }"
    },
    {
      "language": "C",
      "title": "Simple Loop",
      "code": "#include <stdio.h>\nint main() { for (int i = 1; i <= 5; i++) printf(\"%d\\n\", i); return 0; }"
    },
    {
      "language": "Cpp",
      "title": "Hello World",
      "code": "#include <iostream>\nint main() { std::cout << \"Hello, World!\"; return 0; }"
    },
    {
      "language": "Cpp",
      "title": "Sum of Array Elements",
      "code": "#include <iostream>\nusing namespace std;\nint main() { int arr[] = {1, 2, 3, 4, 5}; int sum = 0; for (int x : arr) sum += x; cout << sum; }"
    },
    {
      "language": "Cpp",
      "title": "Class Example",
      "code": "class Person { public: string name; Person(string n) : name(n) {} };"
    },
    {
      "language": "Cpp",
      "title": "Reverse a String",
      "code": "#include <algorithm>\n#include <string>\nstring reverseString(string s) { reverse(s.begin(), s.end()); return s; }"
    },
    {
      "language": "Cpp",
      "title": "Prime Check",
      "code": "bool isPrime(int n) { for (int i = 2; i < n; i++) if (n % i == 0) return false; return true; }"
    },
    {
      "language": "Java",
      "title": "Hello World",
      "code": "public class Main { public static void main(String[] args) { System.out.println(\"Hello, World!\"); } }"
    },
    {
      "language": "Java",
      "title": "Fibonacci Sequence",
      "code": "public static int fib(int n) { return n <= 1 ? n : fib(n - 1) + fib(n - 2); }"
    },
    {
      "language": "Java",
      "title": "Factorial Calculation",
      "code": "public static int factorial(int n) { return n == 0 ? 1 : n * factorial(n - 1); }"
    },
    {
      "language": "Java",
      "title": "Sum of Array",
      "code": "int[] nums = {1, 2, 3, 4, 5};\nint sum = Arrays.stream(nums).sum();"
    },
    {
      "language": "Java",
      "title": "Reverse String",
      "code": "String reverse(String s) { return new StringBuilder(s).reverse().toString(); }"
    },
    {
      "language": "JavaScript",
      "title": "Hello World",
      "code": "console.log(\"Hello, World!\");"
    },
    {
      "language": "JavaScript",
      "title": "Find Maximum",
      "code": "const max = Math.max(...[1, 2, 3, 4, 5]);"
    },
    {
      "language": "JavaScript",
      "title": "Sum of Numbers",
      "code": "const sum = [1, 2, 3, 4].reduce((a, b) => a + b, 0);"
    },
    {
      "language": "JavaScript",
      "title": "Factorial Calculation",
      "code": "const factorial = n => (n === 0 ? 1 : n * factorial(n - 1));"
    },
    {
      "language": "JavaScript",
      "title": "Reverse String",
      "code": "const reverse = str => str.split(\"\").reverse().join(\"\");"
    },
    {
      "language": "Python",
      "title": "Hello World",
      "code": "print(\"Hello, World!\")"
    },
    {
      "language": "Python",
      "title": "Factorial Function",
      "code": "def factorial(n): return 1 if n == 0 else n * factorial(n - 1)"
    },
    {
      "language": "Python",
      "title": "Fibonacci Sequence",
      "code": "def fib(n): return n if n <= 1 else fib(n-1) + fib(n-2)"
    },
    {
      "language": "Python",
      "title": "Sum of Array",
      "code": "nums = [1, 2, 3, 4, 5]\nprint(sum(nums))"
    },
    {
      "language": "Python",
      "title": "Reverse String",
      "code": "s = \"hello\"\nprint(s[::-1])"
    },
    {
      "language": "Go",
      "title": "Hello World",
      "code": "package main\nimport \"fmt\"\nfunc main() { fmt.Println(\"Hello, World!\") }"
    },
    {
      "language": "Go",
      "title": "Factorial Function",
      "code": "func factorial(n int) int { if n == 0 { return 1 }; return n * factorial(n-1) }"
    },
    {
      "language": "Go",
      "title": "Sum of Array",
      "code": "nums := []int{1, 2, 3, 4, 5}\nsum := 0\nfor _, v := range nums { sum += v }"
    },
    {
      "language": "Go",
      "title": "Reverse String",
      "code": "func reverse(s string) string { r := []rune(s); for i, j := 0, len(r)-1; i < j; i, j = i+1, j-1 { r[i], r[j] = r[j], r[i] }; return string(r) }"
    },
    {
      "language": "Go",
      "title": "Check Prime",
      "code": "func isPrime(n int) bool { for i := 2; i < n; i++ { if n%i == 0 { return false } }; return true }"
    },
    {
      "language": "Swift",
      "title": "Hello World",
      "code": "print(\"Hello, World!\")"
    },
    {
      "language": "Swift",
      "title": "Factorial Function",
      "code": "func factorial(_ n: Int) -> Int { return n == 0 ? 1 : n * factorial(n - 1) }"
    },
    {
      "language": "Swift",
      "title": "Reverse String",
      "code": "let str = \"hello\"\nprint(String(str.reversed()))"
    },
    {
      "language": "Swift",
      "title": "Sum of Array",
      "code": "let nums = [1, 2, 3, 4, 5]\nprint(nums.reduce(0, +))"
    },
    {
      "language": "Swift",
      "title": "Fibonacci Sequence",
      "code": "func fib(_ n: Int) -> Int { return n <= 1 ? n : fib(n-1) + fib(n-2) }"
    },
    {
      "language": "Ruby",
      "title": "Hello World",
      "code": "puts \"Hello, World!\""
    },
    {
      "language": "Ruby",
      "title": "Factorial Function",
      "code": "def factorial(n) n == 0 ? 1 : n * factorial(n - 1) end"
    },
    {
      "language": "Ruby",
      "title": "Sum of Array",
      "code": "nums = [1, 2, 3, 4, 5]\nputs nums.sum"
    },
    {
      "language": "Ruby",
      "title": "Reverse String",
      "code": "puts \"hello\".reverse"
    },
    {
      "language": "Ruby",
      "title": "Fibonacci Sequence",
      "code": "def fib(n) n <= 1 ? n : fib(n-1) + fib(n-2) end"
    }
  ]
  
  try {
    for (let i = 1; i <= 30; i++) {
      const hashedPassword = await hashPassword(`password${i}`);
      await prisma.user.create({
        data: {
          username: `user${i}`,
          password: hashedPassword,
          firstName: `First${i}`,
          lastName: `Last${i}`,
          email: `user${i}@example.com`,
          pfpURL: `Option${(i % 5) + 1}.png`,
          phoneNumber: `12345678${i}`,
        },
      });
    }

    for (let i = 1; i <= 40; i++) {
      await prisma.template.create({
        data: {
            uid: ((i % 30) + 1),
            username: `user${(i % 30) + 1}`,
            code: templateCode[i - 1].code,
            language: templateCode[i - 1].language.toLowerCase(),
            title: templateCode[i - 1].title,
            explanation: "Made by ChatGPT",
            tags: `${templateCode[i - 1].language.toLowerCase()}`,
            forkedFrom: null,
            privacy: "PUBLIC",
        },
    });
    }

    for (let i = 1; i <= 80; i++) {
      if (i % 2 == 1) {
        await prisma.post.create({
          data: {
            type: 'BLOG',
            uid: (i % 30) + 1,
            content: `This is the content of blog ${i}`,
            rating: Math.floor(Math.random() * 21) - 10,
          },
        });
        await prisma.blog.create({
          data: {
            postId: i,
            title: `Blog Title ${i}`,
            tags: '',
          },
        });
      }
      else {
        await prisma.post.create({
          data: {
            type: 'COMMENT',
            uid: ((i + 1) % 30) + 1,
            content: `This is the content of comment ${i}`,
            rating: Math.floor(Math.random() * 21) - 10,
          },
        });
        if (i % 4 == 2) {
          await prisma.comment.create({
            data: {
              postId: i,
              parentId: 1,
            },
          });
        }
        else {
          await prisma.comment.create({
            data: {
              postId: i,
              parentId: 2,
            },
          });
        }
      }
    }

    await prisma.user.create({
      data: {
        username: 'admin',
        password: '$2b$10$rvjRIs3NedTaz3bZBawHgeWuwb0Dr6cvckA3S0zACZl2Vr32ze/6y',
        type: 'ADMIN',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        pfpURL: "Option1.png",
        phoneNumber: null,
        theme: 'LIGHT',
      },
    });

  } catch (error) {
    console.log(error)
  }
}

main();