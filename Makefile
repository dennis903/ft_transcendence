NAME = ft_transcendence
DATA_PATH = ~/goinfre/data
DOCKER-COMPOSE = docker-compose

.PHONY: all
all: $(NAME)

$(NAME):
	mkdir -p $(DATA_PATH)
	mkdir -p $(DATA_PATH)/dist
	mkdir -p $(DATA_PATH)/postgresql
	$(DOCKER-COMPOSE) up --build

.PHONY: clean
clean:
	$(DOCKER-COMPOSE) down

.PHONY: fclean
fclean: clean
	rm -rf $(DATA_PATH)

.PHONY: re
re: fclean all