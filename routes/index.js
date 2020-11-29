const express       = require('express');
const Owner         = require('../models/owners');
const Pet           = require('../models/pets');

const router        = express.Router({mergeParams: true});

//Create an owner
router.post("/", (req, res, next) => {
    const newOwner = new Owner({name: req.body.owner});
    newOwner.save()
        .then(owner => {
            return res.status(200).json(owner)
        })
        .catch(err => {
            return next(err)
        })
});

// Get all owners
router.get("/", (req, res, next) => {
    Owner.find({})
        .then(owners => {
            return res.status(200).json(owners)
        })
        .catch(err => {
            return next(err)
        })
});

//Display a single owner
router.get("/:id", (req, res, next) => {
    Owner.findById(req.params.id)
        .then(owner => {
            return res.status(200).json(owner)
        })
        .catch(err => {
            return next(err);
        });
});

//Edit an owner
router.patch("/:id", (req, res, next) => {
    Owner.findByIdAndUpdate(req.params.id, {name: req.body.owner})
        .then(owner => {
            return res.status(200).json(owner);
        })
        .catch(err => {
            return next(err)
        })
});

//Delete an owner
router.delete("/:id", (req, res, next) => {
    Owner.findByIdAndDelete(req.params.id)
        .then(owner => {
            return res.status(200).json(owner);
        })
        .catch(err => {
            return next(err)
        })
});



//Create a pet for an owner
router.post("/:ownerId/pets", (req, res, next) => {
    const newPet = new Pet({name: req.body.petName});

    const { ownerId } = req.params;

    newPet.owner = ownerId;

    return newPet
        .save()
        .then(pet => {
            return Owner.findByIdAndUpdate(
                ownerId,
                {$addToSet: {pets: pet._id}}
            );
        })
        .then(() => {
            return res.status(200).json({
                message: "Pet successfully added!"
            })
        })
        .catch(err => next(err))
});

// Get all pets for a particular owner
router.get("/:ownerId/pets", (req, res, next) => {
    return(
        Owner.findById(req.params.ownerId)
            .populate("pets")
            .exec()
            .then(owner => {
                return res.status(200).json(owner)
            })
            .catch(err => next(err))
    )
});

// Display a single pet for an owner
router.get("/:ownerId/pets/:petId", (req, res, next) => {
    Pet.findById(req.params.petId)
        .then(pet => {
            return res.status(200).json(pet)
        })
        .catch(err => next(err))
});

// Edit a single pet for an owner
router.patch("/:ownerId/pets/:petId", (req, res, next) => {
    Pet.findByIdAndUpdate(req.params.petId, {name: req.body.petName})
        .then(pet => {
            return res.status(200).json(pet)
        })
        .catch(err => next(err));
});

//Delete Unwanted
router.delete("/:ownerId/:petId", (req, res, next) => {
    const { ownerId, petId } = req.params;

    Owner.findByIdAndUpdate(
        ownerId,
        {$pull: {pets: petId}}
    )
    .then(() => {
        return res.status(200).json({
            message: "deleted"
        })
    })
    .catch(err => next(err))
})

// Delete a single pet for an owner
router.delete("/:ownerId/pets/:petId", (req, res, next) => {
    const { ownerId, petId } = req.params;

    return Pet.findByIdAndDelete(petId)
        .then(pet => {
            return Owner.findByIdAndUpdate(
                ownerId,
                {$pull: {pets: pet._id}}
            )
        })
        .then(() => {
            return res.status(200).json({
                message: "Pet successfully deleted"
            })
        })
        .catch(err => next(err))
});


module.exports = router;