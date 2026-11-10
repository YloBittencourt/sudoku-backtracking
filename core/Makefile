CC     = gcc
CFLAGS = -Wall -Wextra -O2

sudoku: sudoku.c
	$(CC) $(CFLAGS) $< -o $@

run: sudoku
	./sudoku

clean:
	rm -f sudoku

.PHONY: run clean

