export const findSolution = `
function find(Array A, Int x) returns Int:
    val Int n;
    i = 0;
    foreach (n of A):
        if (n == k):
            return i;
        end
            i = i + 1;
        end
    return -1;
end

function main() returns Int:
    val Array A;
    val Int a;
    A = createArray(3);
    A[0] = 3;
    A[1] = 8;
    A[2] = 5;
    printInt(find(A, a));
    printInt(find(A));
    printInt(find(a, A));
    return A;
end
`
