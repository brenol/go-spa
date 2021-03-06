package account

import (
	"errors"
	"fmt"

	"github.com/guregu/null"
	"github.com/rafael84/go-spa/backend/database"
)

type userService struct {
	session *database.Session
}

func NewUserService(session *database.Session) *userService {
	return &userService{session}
}

func (us *userService) Create(email, password string, userJsonData *UserJsonData) (*User, error) {
	// encode password
	var saltedPassword SaltedPassword
	err := saltedPassword.Encode(password)
	if err != nil {
		return nil, errors.New("Could not encode password")
	}

	// create new user structure
	user := &User{
		Id:       null.NewInt(0, false),
		State:    UserStateActive,
		Email:    email,
		Password: saltedPassword,
	}

	// fill user structure with additional data
	err = user.JsonData.Set(userJsonData)
	if err != nil {
		return nil, fmt.Errorf("Failed to marshal json data: %s", err)
	}

	// create new user in database
	err = us.session.Create(user)
	if err != nil {
		return nil, fmt.Errorf("Could not persist user: %s", err)
	}

	return user, nil
}

func (us *userService) Update(user *User) error {
	err := us.session.Update(user)
	if err != nil {
		return fmt.Errorf("Could not persist user: %s", err)
	}
	return nil
}

func (us *userService) GetById(id int64) (*User, error) {
	user, err := us.session.One(&User{}, "id = $1", id)
	if err != nil {
		return nil, err
	}
	return user.(*User), nil
}

func (us *userService) GetByEmail(email string) (*User, error) {
	user, err := us.session.One(&User{}, "email = $1", email)
	if err != nil {
		return nil, err
	}
	return user.(*User), nil
}
